from flask import Blueprint, request, jsonify
from sqlalchemy import or_
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity,
)
from werkzeug.security import generate_password_hash, check_password_hash

from api.models import (
    db,
    Usuario,
    Empresa,
    Cliente,
    Instalacion,
    Mantenimiento,
)

api = Blueprint("api", __name__)


# ======================
# HEALTH
# ======================
@api.route("/hello", methods=["GET"])
def hello():
    return jsonify({"message": "API OK"})


# ======================
# SETUP (ONE SHOT)
# ======================
@api.route("/auth/setup", methods=["POST"])
def setup():
    if Usuario.query.first():
        return jsonify({"message": "Setup already completed"}), 403

    data = request.get_json(silent=True)
    if not data or not data.get("email") or not data.get("password"):
        return jsonify({"message": "Invalid data"}), 400

    user = Usuario(
        nombre=data.get("nombre", "Admin"),
        email=data["email"],
        password=generate_password_hash(data["password"]),
        rol="ADMIN",
    )

    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "Setup completed"}), 201


# ======================
# LOGIN
# ======================
@api.route("/auth/login", methods=["POST"])
def login():
    data = request.get_json()

    email = data.get("email")  
    password = data.get("password")

    if not email or not password:
        return {"error": "Datos incompletos"}, 400

    usuario = Usuario.query.filter(
        or_(
            Usuario.email == email,
            Usuario.username == email
        )
    ).first()

    if not usuario or not check_password_hash(usuario.password, password):
        return {"error": "Credenciales inválidas"}, 401

    if not usuario.activo:
        return {"error": "Usuario inactivo"}, 403

    token = create_access_token(identity=usuario.id)

    return {
        "token": token,
        "usuario": usuario.to_dict()
    }

# ======================
# USUARIOS (ADMIN)
# ======================
@api.route("/usuarios", methods=["GET"])
def get_usuarios():
    usuarios = Usuario.query.all()
    return jsonify({"usuarios": [u.to_dict() for u in usuarios]})


@api.route("/usuarios", methods=["POST"])
@jwt_required()
def create_usuario():
    data = request.get_json(force=True)
    if not data:
        return jsonify({"message": "Invalid JSON"}), 400

    if Usuario.query.filter_by(email=data["email"]).first():
        return jsonify({"message": "Email already exists"}), 409

    user = Usuario(
        nombre=data["nombre"],
        email=data["email"],
        username=data.get("username"),
        password=generate_password_hash(data["password"]),
        rol=data.get("rol", "INSTALADOR"),
        empresa_id=data.get("empresa_id"),
    )

    db.session.add(user)
    db.session.commit()

    return jsonify({"user": user.to_dict()}), 201

@api.route("/usuarios/<int:id>", methods=["PUT"])
def update_usuario(id):
    data = request.get_json(force=True)
    if not data:
        return jsonify({"message": "Invalid JSON"}), 400
    
    usuario = Usuario.query.get(id)
    if not usuario:
        return jsonify({"message": "Usuario no encontrado"}), 404
    
    nombre = data.get("nombre")
    email = data.get("email")
    username = data.get("username")
    password = data.get("password")
    rol = data.get("rol")
    empresa_id = data.get("empresa_id")
    
    if nombre: usuario.nombre = nombre
    if email: usuario.email = email
    if username: usuario.username = username
    if password: usuario.password = generate_password_hash(password)
    if rol: usuario.rol = rol
    if empresa_id: usuario.empresa_id = empresa_id
    
    db.session.commit()    
    return jsonify({"usuario": usuario.to_dict()}), 200


@api.route("/usuarios/<int:id>", methods=["DELETE"])
def delete_usuario(id):
    usuario = Usuario.query.get(id)
    if not usuario:
        return jsonify({"message": "Usuario no encontrado"}), 404
    
    db.session.delete(usuario)
    db.session.commit()
    return jsonify({"message": "Usuario eliminado"}), 200

# ======================
# EMPRESAS
# ======================
@api.route("/empresas", methods=["GET"])
def get_empresas():
    empresas = Empresa.query.all()
    return jsonify({"empresas": [e.to_dict() for e in empresas]})

@api.route("/empresas", methods=["POST"])
@jwt_required()
def create_empresa():
    data = request.get_json(force=True)
    if not data:
        return jsonify({"message": "Invalid JSON"}), 400

    empresa = Empresa(
        nombre=data.get("nombre"),
        plan=data.get("plan"),
        max_usuarios=data.get("max_usuarios"),
        activa=data.get("activa"),
    )

    db.session.add(empresa)
    db.session.commit()
    return jsonify({"empresa": empresa.to_dict()}), 201

@api.route("/empresas/<int:id>", methods=["PUT"])
@jwt_required()
def update_empresa(id):
    data = request.get_json(force=True)
    if not data:
        return jsonify({"message": "Invalid JSON"}), 400
    
    empresa = Empresa.query.get(id)
    if not empresa:
        return jsonify({"message": "Empresa no encontrada"}), 404
    
    empresa.nombre = data.get("nombre")
    empresa.plan = data.get("plan")
    empresa.max_usuarios = data.get("max_usuarios")
    empresa.activa = data.get("activa")
    
    db.session.commit()    
    return jsonify({"empresa": empresa.to_dict()}), 200

@api.route("/empresas/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_empresa(id):
    empresa = Empresa.query.get(id)
    if not empresa:
        return jsonify({"message": "Empresa no encontrada"}), 404
    
    db.session.delete(empresa)
    db.session.commit()
    return jsonify({"message": "Empresa eliminada"}), 200


# ======================
# CLIENTES
# ======================
@api.route("/clientes", methods=["POST"])
@jwt_required()
def create_cliente():
    data = request.get_json(force=True)
    if not data:
        return jsonify({"message": "Invalid JSON"}), 400

    cliente = Cliente(
        empresa_id=data["empresa_id"],
        nombre=data["nombre"],
        telefono=data.get("telefono"),
        email=data.get("email"),
        direccion=data.get("direccion"),
        lat=data.get("lat"),
        lng=data.get("lng"),
        observaciones=data.get("observaciones"),
    )

    db.session.add(cliente)
    db.session.commit()
    return jsonify({"cliente": cliente.to_dict()}), 201

@api.route("/clientes/<int:id>", methods=["PUT"])
@jwt_required()
def update_cliente(id):
    data = request.get_json(force=True)
    if not data:
        return jsonify({"message": "Invalid JSON"}), 400
    
    cliente = Cliente.query.get(id)
    if not cliente:
        return jsonify({"message": "Cliente no encontrado"}), 404
    
    cliente.nombre = data.get("nombre")
    cliente.telefono = data.get("telefono")
    cliente.email = data.get("email")
    cliente.direccion = data.get("direccion")
    cliente.lat = data.get("lat")
    cliente.lng = data.get("lng")
    cliente.observaciones = data.get("observaciones")
    
    db.session.commit()
    return jsonify({"cliente": cliente.to_dict()}), 200 

@api.route("/clientes/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_cliente(id):
    cliente = Cliente.query.get(id)
    if not cliente:
        return jsonify({"message": "Cliente no encontrado"}), 404
    
    db.session.delete(cliente)
    db.session.commit()
    return jsonify({"message": "Cliente eliminado"}), 200   

@api.route("/clientes", methods=["GET"])
def get_clientes():
    clientes = Cliente.query.all()
    return jsonify({"clientes": [c.to_dict() for c in clientes]})


# ======================
# INSTALACIONES
# ======================
@api.route("/instalaciones", methods=["POST"])
@jwt_required()
def create_instalacion():
    data = request.get_json(silent=True)

    instalacion = Instalacion(
        empresa_id=data["empresa_id"],
        cliente_id=data["cliente_id"],
        instalador_id=data["instalador_id"],
        tipo_sistema=data["tipo_sistema"],
        fecha_instalacion=data["fecha_instalacion"],
        frecuencia_meses=data.get("frecuencia_meses", 6),
        proximo_mantenimiento=data.get("proximo_mantenimiento"),
    )

    db.session.add(instalacion)
    db.session.commit()
    return jsonify({"instalacion": instalacion.to_dict()}), 201

@api.route("/instalaciones/<int:id>", methods=["PUT"])
@jwt_required()
def update_instalacion(id):
    data = request.get_json(force=True)
    if not data:
        return jsonify({"message": "Invalid JSON"}), 400
    
    instalacion = Instalacion.query.get(id)
    if not instalacion:
        return jsonify({"message": "Instalación no encontrada"}), 404
    
    empresa_id = data.get("empresa_id")
    cliente_id = data.get("cliente_id")
    instalador_id = data.get("instalador_id")
    tipo_sistema = data.get("tipo_sistema")
    fecha_instalacion = data.get("fecha_instalacion")
    frecuencia_meses = data.get("frecuencia_meses")
    proximo_mantenimiento = data.get("proximo_mantenimiento")

    if empresa_id: instalacion.empresa_id = empresa_id
    if cliente_id: instalacion.cliente_id = cliente_id
    if instalador_id: instalacion.instalador_id = instalador_id
    if tipo_sistema: instalacion.tipo_sistema = tipo_sistema
    if fecha_instalacion: instalacion.fecha_instalacion = fecha_instalacion
    if frecuencia_meses: instalacion.frecuencia_meses = frecuencia_meses
    if proximo_mantenimiento: instalacion.proximo_mantenimiento = proximo_mantenimiento
    
    db.session.commit()    
    return jsonify({"instalacion": instalacion.to_dict()}), 200

@api.route("/instalaciones/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_instalacion(id):
    instalacion = Instalacion.query.get(id)
    if not instalacion:
        return jsonify({"message": "Instalación no encontrada"}), 404
    
    db.session.delete(instalacion)
    db.session.commit()
    return jsonify({"message": "Instalación eliminada"}), 200   

@api.route("/instalaciones", methods=["GET"])
def get_instalaciones():
    instalaciones = Instalacion.query.all()
    return jsonify({"instalaciones": [i.to_dict() for i in instalaciones]})

# ======================
# MANTENIMIENTOS
# ======================
@api.route("/mantenimientos", methods=["POST"])
@jwt_required()
def create_mantenimiento():
    data = request.get_json(silent=True)

    mantenimiento = Mantenimiento(
        empresa_id=data["empresa_id"],
        instalacion_id=data["instalacion_id"],
        realizado_por=data["realizado_por"],
        fecha=data["fecha"],
        notas=data.get("notas"),
    )

    db.session.add(mantenimiento)
    db.session.commit()
    return jsonify({"mantenimiento": mantenimiento.to_dict()}), 201

@api.route("/mantenimientos/<int:id>", methods=["PUT"])
@jwt_required()
def update_mantenimiento(id):
    data = request.get_json(force=True)
    if not data:
        return jsonify({"message": "Invalid JSON"}), 400
    
    mantenimiento = Mantenimiento.query.get(id)
    if not mantenimiento:
        return jsonify({"message": "Mantenimiento no encontrado"}), 404
    
    mantenimiento.empresa_id = data.get("empresa_id")
    mantenimiento.instalacion_id = data.get("instalacion_id")
    mantenimiento.realizado_por = data.get("realizado_por")
    mantenimiento.fecha = data.get("fecha")
    mantenimiento.notas = data.get("notas")
    
    db.session.commit()    
    return jsonify({"mantenimiento": mantenimiento.to_dict()}), 200

@api.route("/mantenimientos/<int:id>", methods=["DELETE"])    
@jwt_required()
def delete_mantenimiento(id):
    mantenimiento = Mantenimiento.query.get(id)
    if not mantenimiento:
        return jsonify({"message": "Mantenimiento no encontrado"}), 404
    
    db.session.delete(mantenimiento)
    db.session.commit()
    return jsonify({"message": "Mantenimiento eliminado"}), 200   

@api.route("/mantenimientos", methods=["GET"])
def get_mantenimientos():
    mantenimientos = Mantenimiento.query.all()    
    return jsonify({"mantenimientos": [m.to_dict() for m in mantenimientos]})

# ======================
# CHANGE PASSWORD
# ======================

@api.route("/usuarios/<int:id>/password", methods=["PUT"])
@jwt_required()
def change_password(id):
    data = request.get_json(force=True)

    current_password = data.get("current_password")
    new_password = data.get("new_password")

    if not current_password or not new_password:
        return jsonify({"message": "Datos incompletos"}), 400

    usuario = Usuario.query.get(id)
    if not usuario:
        return jsonify({"message": "Usuario no encontrado"}), 404

    # Verificar contraseña actual
    if not check_password_hash(usuario.password, current_password):
        return jsonify({"message": "Contraseña actual incorrecta"}), 401

    usuario.password = generate_password_hash(new_password)
    db.session.commit()

    return jsonify({"message": "Contraseña actualizada correctamente"}), 200