import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

const prisma = new PrismaClient();

// Definir una interfaz más específica para la cláusula where
interface WhereClause {
  AND: {
    candidates?: {
      name?: {
        contains: string;
        mode: 'insensitive';
      };
    };
    status?: string;
  }[];
}

/**
 * Obtener todos los registros de gestión de candidatos
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const query = url.searchParams.get('query') || '';
    const status = url.searchParams.get('status') || '';
    const pageSize = 15;

    if (page < 1) {
      return NextResponse.json(
        { error: 'El número de página debe ser mayor que 0.' },
        { status: 400 }
      );
    }

    const whereClause: WhereClause = { AND: [] };

    if (query) {
      whereClause.AND.push({
        candidates: {
          name: {
            contains: query,
            mode: 'insensitive',
          },
        },
      });
    }

    if (status) {
      whereClause.AND.push({ status: status });
    }

    const [candidateManagementRecords, total] = await prisma.$transaction([
      prisma.candidate_management.findMany({
        where: whereClause,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          management: true,
          candidates: true,
        },
        orderBy: {
          id: 'asc',
        },
      }),
      prisma.candidate_management.count({
        where: whereClause,
      }),
    ]);

    const mappedRecords = candidateManagementRecords.map(record => ({
      id: record.id,
      name: record.candidates?.name || '',
      role: record.position || '',
      client: record.management?.name || '',
      start: record.start_date,
      end: record.end_date,
      status: record.status || '',
      rate: record.rate || 0,
    }));

    return NextResponse.json({
      total,
      batch: mappedRecords,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error al obtener los registros:', error.message);
      return NextResponse.json(
        { error: `Error al obtener los datos: ${error.message}` },
        { status: 500 }
      );
    } else {
      console.error('Error desconocido:', error);
      return NextResponse.json(
        { error: 'Error desconocido al obtener los datos.' },
        { status: 500 }
      );
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    console.log('Datos recibidos:', data); // Log para debug

    const {
      candidate_id,
      eval_stack,
      eval_comunicacion,
      eval_motivacion,
      eval_cumplimiento,
    } = data;

    // Verificar que los datos existen
    if (!candidate_id) {
      return NextResponse.json(
        { error: 'candidate_id es requerido' },
        { status: 400 }
      );
    }

    console.log('Creando nueva evaluación...'); // Log para debug
    const newEvaluation = await prisma.post_sales_activities.create({
      data: {
        candidate_management_id: candidate_id,
        date: new Date(),
        eval_stack: eval_stack || 0,
        eval_comunicacion: eval_comunicacion || 0,
        eval_motivacion: eval_motivacion || 0,
        eval_cumplimiento: eval_cumplimiento || 0,
      },
    });
    console.log('Nueva evaluación creada:', newEvaluation); // Log para debug

    console.log('Obteniendo todas las evaluaciones...'); // Log para debug
    const allEvaluations = await prisma.post_sales_activities.findMany({
      where: {
        candidate_management_id: candidate_id,
      },
    });
    console.log('Evaluaciones encontradas:', allEvaluations.length); // Log para debug

    const avgRate = allEvaluations.reduce((acc, curr) => {
      const evalStack = curr.eval_stack || 0;
      const evalComunicacion = curr.eval_comunicacion || 0;
      const evalMotivacion = curr.eval_motivacion || 0;
      const evalCumplimiento = curr.eval_cumplimiento || 0;
      
      const evalAvg = (evalStack + evalComunicacion + 
                      evalMotivacion + evalCumplimiento) / 4;
      return acc + evalAvg;
    }, 0) / allEvaluations.length;

    console.log('Actualizando promedio...', avgRate); // Log para debug
    await prisma.candidate_management.update({
      where: {
        id: candidate_id,
      },
      data: {
        rate: avgRate,
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: newEvaluation,
      message: 'Evaluación creada y promedio actualizado'
    });
  } catch (error) {
    console.error('Error detallado:', error); // Log detallado del error
    return NextResponse.json(
      { error: 'Error al crear la evaluación', details: error },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect(); // Asegurarse de cerrar la conexión
  }
}