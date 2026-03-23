const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Starting strictness migration...');

    // 1. Update all Review records
    const reviews = await prisma.review.findMany();
    console.log(`Found ${reviews.length} reviews to migrate.`);

    for (const review of reviews) {
        const newLectures = 5 - review.lecturesRating;
        const newExams = 5 - review.examsRating;

        // Use the new inverted weight logic for the overall rating:
        // (6 - newLectures) + (6 - newExams) + clarity + fairness
        const newRating = Math.round(((6 - newLectures) + (6 - newExams) + review.clarityRating + review.fairnessRating) / 4);

        await prisma.review.update({
            where: { id: review.id },
            data: {
                lecturesRating: newLectures,
                examsRating: newExams,
                rating: newRating
            }
        });
    }
    console.log('Reviews migrated.');

    // 2. Update all Teacher records
    const teachers = await prisma.teacher.findMany();
    console.log(`Found ${teachers.length} teachers to update.`);

    for (const teacher of teachers) {
        const stats = await prisma.review.aggregate({
            where: { teacherId: teacher.id },
            _avg: {
                rating: true,
                lecturesRating: true,
                examsRating: true,
                clarityRating: true,
                fairnessRating: true
            },
            _count: { _all: true }
        });

        await prisma.teacher.update({
            where: { id: teacher.id },
            data: {
                overallRating: stats._avg?.rating || 0,
                lecturesRating: stats._avg?.lecturesRating || 0,
                examsRating: stats._avg?.examsRating || 0,
                clarityRating: stats._avg?.clarityRating || 0,
                fairnessRating: stats._avg?.fairnessRating || 0,
                reviewsCount: stats._count?._all || 0
            }
        });
    }
    console.log('Teachers updated.');
    console.log('Migration complete!');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
