import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import BigCalendar from "@/components/BigCalender";
import EventCalendar from "@/components/EventCalendar";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

const StudentPage = async () => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  
  // Properly type the classItem to fix TypeScript errors
  let classItem: Array<{id: number, name: string}> = [];
  let pageTitle = "Schedule";
  let classId: number | undefined;

  // Handle different roles appropriately
  if (role === "student") {
    // For students, find classes they belong to
    classItem = await prisma.class.findMany({
      where: {
        students: { some: { id: userId! } },
      },
    });
    
    if (classItem && classItem.length > 0) {
      pageTitle = `Schedule (${classItem[0].name})`;
      classId = classItem[0].id;
    }
  } else if (role === "teacher") {
    // For teachers, find classes they teach (using supervisorId not teacherId)
    classItem = await prisma.class.findMany({
      where: {
        supervisorId: userId!,
      },
      take: 1,
    });
    
    if (classItem && classItem.length > 0) {
      pageTitle = `Schedule (${classItem[0].name} - Teacher View)`;
      classId = classItem[0].id;
    }
  }

  console.log(classItem);
  return (
    <div className="p-4 flex gap-4 flex-col xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        <div className="h-full bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">{pageTitle}</h1>
          {classId ? (
            <BigCalendarContainer type="classId" id={classId} />
          ) : (
            <div className="text-center p-8 text-gray-500">
              <p>No class assigned yet. Please contact an administrator.</p>
            </div>
          )}
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        <EventCalendar />
        <Announcements />
      </div>
    </div>
  );
};

export default StudentPage;
