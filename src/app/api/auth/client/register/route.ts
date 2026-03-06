import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nombre, correo, contrasena, id_rol } = body;

    console.log('📝 Solicitud de registro recibida:', { nombre, correo, id_rol });

    // Validaciones
    if (!nombre || !correo || !contrasena) {
      console.log('❌ Faltan campos obligatorios');
      return Response.json(
        {
          success: false,
          error: 'Todos los campos son obligatorios',
        },
        { status: 400 }
      );
    }

    // Verificar si el correo ya existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { correo },
    });

    if (usuarioExistente) {
      console.log('❌ Correo ya registrado:', correo);
      return Response.json(
        {
          success: false,
          error: 'Este correo ya está registrado',
        },
        { status: 400 }
      );
    }

    // Hash de la contraseña
    console.log('🔐 Hasheando contraseña...');
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // Crear usuario
    console.log('💾 Creando usuario en la base de datos...');
    const nuevoUsuario = await prisma.usuario.create({
      data: {
        nombre,
        correo,
        contrasena: hashedPassword,
        id_rol: id_rol || 3, // Por defecto Usuario común
        foto_evidencia: null,
      },
    });

    console.log('✅ Usuario creado exitosamente:', nuevoUsuario.id_usuario);

    // Generar token JWT
    const token = jwt.sign(
      {
        id: nuevoUsuario.id_usuario,
        role: nuevoUsuario.id_rol,
      },
      process.env.JWT_SECRET || 'secreto_temporal',
      { expiresIn: '7d' }
    );

    // Obtener nombre del rol
    const rol = await prisma.rol.findUnique({
      where: { id_rol: nuevoUsuario.id_rol },
    });

    console.log('🎉 Registro completado exitosamente');

    return Response.json(
      {
        success: true,
        message: 'Usuario registrado exitosamente',
        data: {
          user: {
            id: nuevoUsuario.id_usuario,
            nombre: nuevoUsuario.nombre,
            correo: nuevoUsuario.correo,
            rol: nuevoUsuario.id_rol,
            nombre_rol: rol?.nombre_rol || 'Usuario',
            foto_evidencia: nuevoUsuario.foto_evidencia,
          },
          token,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ Error al registrar usuario:', error);
    return Response.json(
      {
        success: false,
        error: 'Error al registrar usuario',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}