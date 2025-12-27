from flask_sqlalchemy import SQLAlchemy  # type: ignore
from config import Config

db = SQLAlchemy(engine_options=Config.SQLALCHEMY_ENGINE_OPTIONS)


class Empresa(db.Model):
    __tablename__ = "empresas"

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(120), nullable=False)

    plan = db.Column(db.String(50), default="FREE")
    max_usuarios = db.Column(db.Integer, default=1)
    activa = db.Column(db.Boolean, default=True)

    created_at = db.Column(db.DateTime, default=db.func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "plan": self.plan,
            "max_usuarios": self.max_usuarios,
            "activa": self.activa,
        }


class Usuario(db.Model):
    __tablename__ = "usuarios"

    id = db.Column(db.Integer, primary_key=True)
    empresa_id = db.Column(db.Integer, db.ForeignKey("empresas.id"))

    nombre = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)

    rol = db.Column(db.String(30), nullable=False)  
    # ADMIN | SUPERVISOR | INSTALADOR

    activo = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=db.func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "empresa_id": self.empresa_id,
            "nombre": self.nombre,
            "email": self.email,
            "rol": self.rol,
            "activo": self.activo,
        }


class Cliente(db.Model):
    __tablename__ = "clientes"

    id = db.Column(db.Integer, primary_key=True)
    empresa_id = db.Column(db.Integer, db.ForeignKey("empresas.id"))

    nombre = db.Column(db.String(120), nullable=False)
    telefono = db.Column(db.String(50))
    email = db.Column(db.String(120))
    direccion = db.Column(db.String(255))

    lat = db.Column(db.Float)
    lng = db.Column(db.Float)

    observaciones = db.Column(db.Text)
    activo = db.Column(db.Boolean, default=True)

    created_at = db.Column(db.DateTime, default=db.func.now())

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
        }


class Instalacion(db.Model):
    __tablename__ = "instalaciones"

    id = db.Column(db.Integer, primary_key=True)
    empresa_id = db.Column(db.Integer, db.ForeignKey("empresas.id"))
    cliente_id = db.Column(db.Integer, db.ForeignKey("clientes.id"))
    instalador_id = db.Column(db.Integer, db.ForeignKey("usuarios.id"))

    tipo_sistema = db.Column(db.String(50))
    # CAMARAS | ALARMAS | AMBOS

    fecha_instalacion = db.Column(db.Date, nullable=False)
    frecuencia_meses = db.Column(db.Integer, default=6)
    proximo_mantenimiento = db.Column(db.Date)

    activa = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=db.func.now())

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
                if self.proximo_mantenimiento else None
            ),
            "activa": self.activa,
        }


class Mantenimiento(db.Model):
    __tablename__ = "mantenimientos"

    id = db.Column(db.Integer, primary_key=True)
    empresa_id = db.Column(db.Integer, db.ForeignKey("empresas.id"))
    instalacion_id = db.Column(db.Integer, db.ForeignKey("instalaciones.id"))
    realizado_por = db.Column(db.Integer, db.ForeignKey("usuarios.id"))

    fecha = db.Column(db.Date, nullable=False)
    notas = db.Column(db.Text)

    created_at = db.Column(db.DateTime, default=db.func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "empresa_id": self.empresa_id,
            "instalacion_id": self.instalacion_id,
            "realizado_por": self.realizado_por,
            "fecha": self.fecha.isoformat(),
            "notas": self.notas,
        }




# Índices
db.Index("idx_cliente_empresa", Cliente.empresa_id)
db.Index("idx_instalacion_empresa", Instalacion.empresa_id)
db.Index("idx_mantenimiento_empresa", Mantenimiento.empresa_id)
db.Index("idx_mantenimiento_instalacion", Mantenimiento.instalacion_id)
db.Index("idx_usuario_empresa", Usuario.empresa_id)
