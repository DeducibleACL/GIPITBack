import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

/**
 * @swagger
 * /post_sales_activities:
 *   post:
 *     summary: Crear una nueva actividad de ventas
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               candidate_management_id:
 *                 type: integer
 *               benefit:
 *                 type: string
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               associated_cost:
 *                 type: number
 *               created_at:
 *                 type: string
 *                 format: date-time
 *               updated_at:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Actividad de ventas creada exitosamente
 *       500:
 *         description: Error al crear la actividad de ventas
 */
export async function POST(req: NextRequest) {
  try {
    const {
      benefit,
      client_comment,
      date,
      eval_stack,
      eval_comunicacion,
      eval_motivacion,
      eval_cumplimiento,
      acciones_acl,
      proyecction,
      candidate_management_id,
    } = await req.json();

    const postSalesActivity = await prisma.post_sales_activities.create({
      data: {
        benefit,
        client_comment,
        date,
        eval_stack,
        eval_comunicacion,
        eval_motivacion,
        eval_cumplimiento,
        acciones_acl,
        proyecction,
        candidate_management_id,
        updated_at: new Date(),
      },
    });
    return NextResponse.json(postSalesActivity, { status: 201 });
  } catch (error) {
    console.error('Error detallado:', error);
    return NextResponse.json(
      { error: `Error creating post sales activity - ${error}` },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /post_sales_activities:
 *   get:
 *     summary: Obtener todas las actividades de ventas
 *     responses:
 *       200:
 *         description: Lista de actividades de ventas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PostSalesActivity'
 */
export async function GET() {
  try {
    const postSalesActivities = await prisma.post_sales_activities.findMany();
    return NextResponse.json(postSalesActivities);
  } catch (error) {
    return NextResponse.json(
      { error: `Error fetching post sales activities - ${error}` },
      { status: 500 }
    );
  }
}
