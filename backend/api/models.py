from flask_sqlalchemy import SQLAlchemy  # type: ignore
from config import Config

db = SQLAlchemy(engine_options=Config.SQLALCHEMY_ENGINE_OPTIONS)


# =========================
# EMPRESA
# =========================
class Empresa(db.Model):
    __tablename__ = "empresas"

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(120), nullable=False)

    plan = db.Column(db.String(50), default="FREE")
    max_usuarios = db.Column(db.Integer, default=1)
    activa = db.Column(db.Boolean, default=True)

    created_at = db.Column(db.DateTime, default=db.func.now())

    # RELACIONES
    usuarios = db.relationship(
        "Usuario",
        back_populates="empresa",
        lazy="selectin",
        cascade="all, delete-orphan",
    )

    clientes = db.relationship(
        "Cliente",
        back_populates="empresa",
        lazy="selectin",
        cascade="all, delete-orphan",
    )

    instalaciones = db.relationship(
        "Instalacion",
        back_populates="empresa",
        lazy="selectin",
        cascade="all, delete-orphan",
    )

    mantenimientos = db.relationship(
        "Mantenimiento",
        back_populates="empresa",
        lazy="selectin",
        cascade="all, delete-orphan",
    )

    pendientes = db.relationship("Pendiente", back_populates="empresa", lazy="selectin", cascade="all, delete-orphan")

    presupuestos = db.relationship("Presupuesto", back_populates="empresa", lazy="selectin", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "plan": self.plan,
            "max_usuarios": self.max_usuarios,
            "activa": self.activa,
        }


# =========================
# USUARIO
# =========================
class Usuario(db.Model):
    __tablename__ = "usuarios"

    id = db.Column(db.Integer, primary_key=True)
    empresa_id = db.Column(db.Integer, db.ForeignKey("empresas.id"), nullable=False)

    nombre = db.Column(db.String(120), nullable=False)
    username = db.Column(db.String(120), unique=True, nullable=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)

    rol = db.Column(db.String(30), nullable=False)
    # ADMIN | SUPERVISOR | INSTALADOR

    activo = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=db.func.now())

    # RELACIONES
    empresa = db.relationship("Empresa", back_populates="usuarios")

    instalaciones = db.relationship(
        "Instalacion",
        back_populates="instalador",
        lazy="selectin",
    )

    mantenimientos = db.relationship(
        "Mantenimiento",
        back_populates="tecnico",
        lazy="selectin",
    )

    def to_dict(self):
        return {
            "id": self.id,
            "empresa_id": self.empresa_id,
            "nombre": self.nombre,
            "username": self.username,
            "email": self.email,
            "rol": self.rol,
            "activo": self.activo,
        }


# =========================
# CLIENTE
# =========================
class Cliente(db.Model):
    __tablename__ = "clientes"

    id = db.Column(db.Integer, primary_key=True)
    empresa_id = db.Column(db.Integer, db.ForeignKey("empresas.id"), nullable=False)

    nombre = db.Column(db.String(120), nullable=False)
    telefono = db.Column(db.String(50))
    email = db.Column(db.String(120))
    direccion = db.Column(db.String(255))

    lat = db.Column(db.Float)
    lng = db.Column(db.Float)

    observaciones = db.Column(db.Text)
    activo = db.Column(db.Boolean, default=True)

    created_at = db.Column(db.DateTime, default=db.func.now())

    # RELACIONES
    empresa = db.relationship("Empresa", back_populates="clientes")

    instalaciones = db.relationship(
        "Instalacion",
        back_populates="cliente",
        lazy="selectin",
        cascade="all, delete-orphan",
    )

    pendientes = db.relationship("Pendiente", back_populates="cliente", lazy="selectin", cascade="all, delete-orphan")

    presupuestos = db.relationship("Presupuesto", back_populates="cliente", lazy="selectin", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "empresa_id": self.empresa_id,
            "nombre": self.nombre,
            "telefono": self.telefono,
            "email": self.email,
            "direccion": self.direccion,
            "lat": self.lat,
            "lng": self.lng,
            "observaciones": self.observaciones,
            "activo": self.activo,
            "instalaciones": [i.to_dict() for i in self.instalaciones],
            "pendientes": [p.to_dict() for p in self.pendientes],
            "presupuestos": [p.to_dict() for p in self.presupuestos],
        }


# =========================
# INSTALACION
# =========================
class Instalacion(db.Model):
    __tablename__ = "instalaciones"

    id = db.Column(db.Integer, primary_key=True)
    empresa_id = db.Column(db.Integer, db.ForeignKey("empresas.id"), nullable=False)
    cliente_id = db.Column(db.Integer, db.ForeignKey("clientes.id"), nullable=False)
    instalador_id = db.Column(db.Integer, db.ForeignKey("usuarios.id"))

    tipo_sistema = db.Column(db.String(50))
    # CAMARAS | ALARMAS | AMBOS

    fecha_instalacion = db.Column(db.Date, nullable=False)
    frecuencia_meses = db.Column(db.Integer, default=6)
    proximo_mantenimiento = db.Column(db.Date)

    activa = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=db.func.now())

    # RELACIONES
    empresa = db.relationship("Empresa", back_populates="instalaciones")

    cliente = db.relationship("Cliente", back_populates="instalaciones")

    instalador = db.relationship("Usuario", back_populates="instalaciones")

    mantenimientos = db.relationship(
        "Mantenimiento",
        back_populates="instalacion",
        lazy="selectin",
        cascade="all, delete-orphan",
    )

    pendientes = db.relationship("Pendiente", back_populates="instalacion", lazy="selectin", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "empresa_id": self.empresa_id,
            "cliente_id": self.cliente_id,
            "instalador_id": self.instalador_id,
            "tipo_sistema": self.tipo_sistema,
            "fecha_instalacion": self.fecha_instalacion.isoformat(),
            "frecuencia_meses": self.frecuencia_meses,
            "proximo_mantenimiento": (
                self.proximo_mantenimiento.isoformat()
                if self.proximo_mantenimiento
                else None
            ),
            "activa": self.activa,
            "mantenimientos": [m.to_dict() for m in self.mantenimientos],
            "pendientes": [p.to_dict() for p in self.pendientes],
        }


# =========================
# MANTENIMIENTO
# =========================
class Mantenimiento(db.Model):
    __tablename__ = "mantenimientos"

    id = db.Column(db.Integer, primary_key=True)
    empresa_id = db.Column(db.Integer, db.ForeignKey("empresas.id"), nullable=False)
    instalacion_id = db.Column(
        db.Integer, db.ForeignKey("instalaciones.id"), nullable=False
    )
    realizado_por = db.Column(db.Integer, db.ForeignKey("usuarios.id"))

    fecha = db.Column(db.Date, nullable=False)
    notas = db.Column(db.Text)

    created_at = db.Column(db.DateTime, default=db.func.now())

    # RELACIONES
    empresa = db.relationship("Empresa", back_populates="mantenimientos")

    instalacion = db.relationship("Instalacion", back_populates="mantenimientos")

    tecnico = db.relationship("Usuario", back_populates="mantenimientos")

    def to_dict(self):
        return {
            "id": self.id,
            "empresa_id": self.empresa_id,
            "instalacion_id": self.instalacion_id,
            "realizado_por": self.realizado_por,
            "fecha": self.fecha.isoformat(),
            "notas": self.notas,
        }
    
# =========================
# PENDIENTES
# =========================

class Pendiente(db.Model):
    __tablename__ = "pendientes"
    id = db.Column(db.Integer, primary_key=True)
    empresa_id = db.Column(db.Integer, db.ForeignKey("empresas.id"), nullable=False)
    cliente_id = db.Column(db.Integer, db.ForeignKey("clientes.id"), nullable=False)
    instalacion_id = db.Column(db.Integer, db.ForeignKey("instalaciones.id"), nullable=False)
    fecha = db.Column(db.Date, nullable=False)
    notas = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=db.func.now())


    # RELACIONES
    empresa = db.relationship("Empresa", back_populates="pendientes")

    cliente = db.relationship("Cliente", back_populates="pendientes")

    instalacion = db.relationship("Instalacion", back_populates="pendientes")

    def to_dict(self):
        return {
            "id": self.id,
            "empresa_id": self.empresa_id,
            "cliente_id": self.cliente_id,
            "instalacion_id": self.instalacion_id,
            "fecha": self.fecha.isoformat(),
            "notas": self.notas,
        }

# =========================
# PRESUPUESTOS
# =========================
class Presupuesto(db.Model):
    __tablename__ = "presupuestos"

    id = db.Column(db.Integer, primary_key=True)
    empresa_id = db.Column(db.Integer, db.ForeignKey("empresas.id"), nullable=False)
    cliente_id = db.Column(db.Integer, db.ForeignKey("clientes.id"))
    cliente_nombre = db.Column(db.String(120))
    cliente_telefono = db.Column(db.String(50))
    cliente_direccion = db.Column(db.String(255))
    cliente_email = db.Column(db.String(120))

    tipo_sistema = db.Column(db.String(50))
    descripcion = db.Column(db.Text)
    total = db.Column(db.Float)

    estado = db.Column(db.String(50), default="pendiente")
    creado_por = db.Column(db.Integer, db.ForeignKey("usuarios.id"))

    # RELACIONES
    empresa = db.relationship("Empresa", back_populates="presupuestos")

    cliente = db.relationship("Cliente", back_populates="presupuestos")

    componentes = db.relationship("Componente", back_populates="presupuesto")

    def to_dict(self):
        return {
            "id": self.id,
            "empresa_id": self.empresa_id,
            "cliente_id": self.cliente_id,
            "cliente_nombre": self.cliente_nombre,
            "cliente_telefono": self.cliente_telefono,
            "cliente_direccion": self.cliente_direccion,
            "cliente_email": self.cliente_email,
            "tipo_sistema": self.tipo_sistema,
            "descripcion": self.descripcion,
            "total": self.total,
            "estado": self.estado,
            "creado_por": self.creado_por,
            "componentes": [c.to_dict() for c in self.componentes],
        }
    
# =========================
# COMPONENTES
# =========================
class Componente(db.Model):
    __tablename__ = "componentes"    
    id = db.Column(db.Integer, primary_key=True)
    presupuesto_id = db.Column(db.Integer, db.ForeignKey("presupuestos.id"), nullable=False)
    nombre = db.Column(db.String(120), nullable=False)
    cantidad = db.Column(db.Integer, nullable=False)
    precio = db.Column(db.Float, nullable=False)
    
    # RELACIONES
    presupuesto = db.relationship("Presupuesto", back_populates="componentes")

# =========================
# INDICES
# =========================
db.Index("idx_usuario_empresa", Usuario.empresa_id)
db.Index("idx_cliente_empresa", Cliente.empresa_id)
db.Index("idx_instalacion_empresa", Instalacion.empresa_id)
db.Index("idx_mantenimiento_empresa", Mantenimiento.empresa_id)
db.Index("idx_mantenimiento_instalacion", Mantenimiento.instalacion_id)
db.Index("idx_pendiente_empresa", Pendiente.empresa_id)
db.Index("idx_pendiente_cliente", Pendiente.cliente_id)
db.Index("idx_pendiente_instalacion", Pendiente.instalacion_id)
