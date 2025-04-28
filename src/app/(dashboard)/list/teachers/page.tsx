import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { Class, Prisma, Subject, Teacher } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";

type TeacherList = Teacher & { subjects: Subject[] } & { classes: Class[] };

const TeacherListPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) => {
  // Properly await auth() before accessing properties in Next.js 15
  const authObj = await auth();
  const { sessionClaims } = authObj;
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const columns = [
    {
      header: "Info",
      accessor: "info",
    },
    {
      header: "Teacher ID",
      accessor: "teacherId",
      className: "hidden md:table-cell",
    },
    {
      header: "Subjects",
      accessor: "subjects",
      className: "hidden md:table-cell",
    },
    {
      header: "Classes",
      accessor: "classes",
      className: "hidden md:table-cell",
    },
    {
      header: "Phone",
      accessor: "phone",
      className: "hidden lg:table-cell",
    },
    {
      header: "Address",
      accessor: "address",
      className: "hidden lg:table-cell",
    },
    ...(role === "admin"
      ? [
          {
            header: "Actions",
            accessor: "action",
          },
        ]
      : []),
  ];

  const renderRow = (item: TeacherList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">
        <Image
          src={item.img || "/noAvatar.png"}
          alt=""
          width={40}
          height={40}
          className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
        />
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-xs text-gray-500">{item?.email}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.username}</td>
      <td className="hidden md:table-cell">
        {item.subjects.map((subject) => subject.name).join(",")}
      </td>
      <td className="hidden md:table-cell">
        {item.classes.map((classItem) => classItem.name).join(",")}
      </td>
      <td className="hidden md:table-cell">{item.phone}</td>
      <td className="hidden md:table-cell">{item.address}</td>
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/list/teachers/${item.id}`}>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky" aria-label="View teacher details">
              <Image src="/view.png" alt="View" width={16} height={16} />
            </button>
          </Link>
          {role === "admin" && (
            // <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaPurple">
            //   <Image src="/delete.png" alt="" width={16} height={16} />
            // </button>
            <FormContainer table="teacher" type="delete" id={item.id} />
          )}
        </div>
      </td>
    </tr>
  );
  // Properly await searchParams before destructuring in Next.js 15
  const params = await searchParams;
  const page = typeof params.page === 'string' ? params.page : params.page?.[0];
  
  // Extract query parameters, ensuring string values for Prisma
  const queryParams: { [key: string]: string | undefined } = {};

  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION

  const query: Prisma.TeacherWhereInput = {};

  // Copy other params excluding page, ensuring string values
  Object.keys(params).forEach(key => {
    if (key !== 'page') {
      const value = params[key];
      queryParams[key] = typeof value === 'string' ? value : value?.[0];
    }
  });

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "classId":
            query.lessons = {
              some: {
                classId: parseInt(value),
              },
            };
            break;
          case "search":
            query.name = { contains: value, mode: "insensitive" };
            break;
          default:
            break;
        }
      }
    }
  }

  // Use try/catch to properly handle database errors
  try {
    // Separate count query for better performance
    const count = await prisma.teacher.count({ where: query });
    
    // Optimize the main query with select instead of include where possible
    const data = await prisma.teacher.findMany({
      where: query,
      include: {
        // Select only necessary fields from related data to reduce payload size
        subjects: {
          select: {
            id: true,
            name: true,
          }
        },
        classes: {
          select: {
            id: true,
            name: true,
          }
        },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    });

    return (
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        {/* TOP */}
        <div className="flex items-center justify-between">
          <h1 className="hidden md:block text-lg font-semibold">All Teachers</h1>
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <TableSearch />
            <div className="flex items-center gap-4 self-end">
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow" aria-label="Filter teachers">
                <Image src="/filter.png" alt="Filter" width={14} height={14} />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow" aria-label="Sort teachers">
                <Image src="/sort.png" alt="Sort" width={14} height={14} />
              </button>
              {role === "admin" && (
                <FormContainer table="teacher" type="create" />
              )}
            </div>
          </div>
        </div>
        {/* LIST */}
        <Table columns={columns} renderRow={renderRow} data={data} />
        {/* PAGINATION */}
        <Pagination page={p} count={count} />
      </div>
    );
  } catch (error) {
    // Log the error for debugging purposes
    console.error("Error fetching teachers data:", error);
    
    // Return a user-friendly error UI
    return (
      <div className="bg-white p-6 rounded-md flex-1 m-4 mt-0">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4 max-w-md text-center">
            <h2 className="text-lg font-semibold mb-2">Error Loading Teachers</h2>
            <p className="text-sm">
              {error instanceof Error 
                ? error.message 
                : "There was a problem loading the teachers list. Please try again later."}
            </p>
          </div>
          <div className="mt-4 flex gap-4">
            <Link href="/" className="px-4 py-2 bg-gray-100 rounded-md text-sm hover:bg-gray-200">
              Return to Dashboard
            </Link>
            <Link href="/list/teachers" className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600">
              Try Again
            </Link>
          </div>
        </div>
      </div>
    );
  }
};

export default TeacherListPage;
