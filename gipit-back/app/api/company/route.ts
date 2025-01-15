import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

/**
 * @swagger
 * /company:
 *   get:
 *     summary: Obtener lista de todos los clientes
 *     description: Retorna una lista de todos los clientes ordenados alfabéticamente
 *     tags: [Clientes]
 *     responses:
 *       200:
 *         description: Lista de clientes obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Company'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 * 
 *   post:
 *     summary: Crear un nuevo cliente
 *     description: Crea un nuevo registro de cliente con los datos proporcionados
 *     tags: [Clientes]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre del cliente
 *               logo:
 *                 type: string
 *                 format: binary
 *                 description: Logo del cliente
 *               description:
 *                 type: string
 *                 description: Descripción del cliente
 *     responses:
 *       201:
 *         description: Cliente creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Company'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

export async function GET() {
  try {
    // Consulta para incluir las jefaturas (management) de cada compañía
    const companies = await prisma.company.findMany({
      orderBy: {
        name: "asc",
      },
      include: {
        management: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(companies, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: `Error fetching companies: ${error}` },
      { status: 500 }
    );
  }
}

// POST: Crear una nueva compañía
export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Validar y procesar el logo
    let logoBuffer: Buffer | null = null;
    if (data.logo) {
      try {
        // Intentar convertir el logo a Buffer
        logoBuffer = Buffer.from(data.logo);
      } catch (error) {
        throw new Error("El logo no está en un formato válido." + error);
      }
    }

    // Filtrar los datos para incluir solo los campos válidos
    const filteredData = {
      name: data.name,
      logo: logoBuffer, // Puede ser Buffer o null
      description: data.description,
    };

    // Crear la nueva compañía
    const newCompany = await prisma.company.create({
      data: filteredData,
    });

    return NextResponse.json(newCompany, { status: 201 });
  } catch (error) {
    // Manejo de error: verificar que sea una instancia de Error
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error creando compañía:", errorMessage);

    return NextResponse.json(
      { error: `Error creating company: ${errorMessage}` },
      { status: 500 }
    );
  }
}
