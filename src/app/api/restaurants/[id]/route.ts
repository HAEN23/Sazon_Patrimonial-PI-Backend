import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    // Las versiones nuevas de Next.js exigen poner 'await' a los parámetros
    const params = await props.params;
    const id = params.id;

    console.log("¡El backend recibió el clic para el ID:", id, "!");

    // Retornamos información de prueba "falsa" para comprobar la conexión
    return NextResponse.json({
      success: true,
      mensaje: "¡LA RUTA FUNCIONA PERFECTAMENTE!",
      data: {
        id: id,
        name: "Restaurante de Prueba (Conexión Exitosa)",
        schedule: "Lunes a Domingo",
        address: "La conexión entre Front y Back funciona"
      }
    });

  } catch (error) {
    console.error("Error en la ruta:", error);
    return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
  }
}