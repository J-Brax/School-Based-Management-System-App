"use server";

import prisma from "./prisma";
import { revalidatePath } from "next/cache";
import {
  AssignmentSchema,
  ClassSchema,
  ExamSchema,
  EventSchema,
  LessonSchema,
  ParentSchema,
  ResultSchema,
  StudentSchema,
  SubjectSchema,
  TeacherSchema,
} from "./formValidationSchemas";
import { Prisma } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";

// Type assertion to resolve TypeScript errors with Clerk client
type ClerkType = typeof clerkClient & {
  users: {
    createUser: Function;
    getUser: Function;
    deleteUser: (userId: string) => Promise<any>;
  };
};


type CurrentState = { success: boolean; error: boolean };

export const createSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    await prisma.subject.create({
      data: {
        name: data.name,
        teachers: {
          connect: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    await prisma.subject.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        teachers: {
          set: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteSubject = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.subject.delete({
      where: {
        id: parseInt(id),
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createClass = async (
  currentState: CurrentState,
  data: ClassSchema
) => {
  try {
    // Create cleaned data object without supervisorId if it's empty
    const cleanedData = {
      name: data.name,
      capacity: data.capacity,
      gradeId: data.gradeId,
      ...(data.supervisorId ? { supervisorId: data.supervisorId } : {})
    };
    
    await prisma.class.create({
      data: cleanedData,
    });

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateClass = async (
  currentState: CurrentState,
  data: ClassSchema
) => {
  try {
    // Create cleaned data object without supervisorId if it's empty
    const cleanedData = {
      name: data.name,
      capacity: data.capacity,
      gradeId: data.gradeId,
      ...(data.supervisorId ? { supervisorId: data.supervisorId } : {})
    };
    
    await prisma.class.update({
      where: {
        id: data.id,
      },
      data: cleanedData,
    });

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteClass = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.class.delete({
      where: {
        id: parseInt(id),
      },
    });

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export async function createTeacher(
  currentState: CurrentState,
  data: TeacherSchema
): Promise<{ success: boolean; error: boolean; message?: string }> {
  try {
    console.log("Creating teacher with data:", {
      username: data.username,
      // Don't log password
      firstName: data.name,
      lastName: data.surname,
      emailAddress: data.email ? [data.email] : [],
      hasSubjects: data.subjects && data.subjects.length > 0
    });
    
    // Create user with clerk using the correct API for Next.js 15
    // Initialize clerkClient properly
    const clerk = await clerkClient();
    
    let user;
    try {
      // Using type assertion to satisfy both TypeScript and the Clerk API
      // Use the correct parameter structure for Clerk v5.7.5
      user = await clerk.users.createUser({
        username: data.username,
        password: data.password,
        firstName: data.name,
        lastName: data.surname,
        // Instead of using emailAddress or email_address, use the proper structure:
        ...(data.email ? { emailAddresses: [{ emailAddress: data.email }] } : {}),
        publicMetadata: { role: "teacher" }
      });
    } catch (clerkError: any) {
      console.error("Clerk API Error details:", clerkError);
      
      // Extract specific details from Clerk error
      console.error("Clerk Error Status:", clerkError?.status);
      console.error("Clerk Error Trace ID:", clerkError?.clerkTraceId);
      console.error("Clerk Errors:", clerkError?.errors);
      
      // More user-friendly error message based on common Clerk errors
      let errorMessage = "Something went wrong while creating the user.";
      
      if (clerkError?.errors && Array.isArray(clerkError.errors)) {
        const errors = clerkError.errors.map((err: any) => ({
          code: err.code,
          message: err.message,
          longMessage: err.longMessage
        }));
        
        console.error("Detailed Clerk errors:", JSON.stringify(errors, null, 2));
        
        // Check for common errors and provide better messages
        if (errors.some((e: any) => e.code === "form_password_pwned")) {
          errorMessage = "This password has been compromised in a data breach. Please choose a stronger password.";
        } else if (errors.some((e: any) => e.code === "form_identifier_exists")) {
          errorMessage = "A user with this username or email already exists.";
        } else if (errors.some((e: any) => e.code === "form_password_length_too_short")) {
          errorMessage = "Password is too short. Please use at least 8 characters.";
        } else if (errors.some((e: any) => e.code === "form_identifier_not_found")) {
          errorMessage = "User with this identifier not found.";
        }
      }
      
      return { success: false, error: true, message: errorMessage };
    }
    
    if (!user) {
      return { success: false, error: true, message: "Failed to create user with Clerk." };
    }
    
    // Create cleaned data object with subjects only if they exist
    const teacherData = {
      id: user.id,
      username: data.username,
      name: data.name,
      surname: data.surname,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address,
      img: data.img || null,
      bloodType: data.bloodType,
      sex: data.sex,
      birthday: data.birthday,
      ...(data.subjects && data.subjects.length > 0 ? {
        subjects: {
          connect: data.subjects.map((subjectId: string) => ({
            id: parseInt(subjectId),
          })),
        }
      } : {})
    };
    
    await prisma.teacher.create({
      data: teacherData,
    });

    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (error) {
    console.error("Non-Clerk error creating teacher:", error);
    return { success: false, error: true, message: "An unexpected error occurred. Please try again." };
  }
};

export const updateTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    // Type assertion to fix TS errors while maintaining functionality
    const user = await (clerkClient as ClerkType).users.getUser(data.id);
    await user.update({
      username: data.username,
      ...(data.password !== "" && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });

    // Create cleaned data object with subjects only if they exist
    const teacherData = {
      ...(data.password !== "" && { password: data.password }),
      username: data.username,
      name: data.name,
      surname: data.surname,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address,
      img: data.img || null,
      bloodType: data.bloodType,
      sex: data.sex,
      birthday: data.birthday,
      ...(data.subjects && data.subjects.length > 0 ? {
        subjects: {
          set: data.subjects.map((subjectId: string) => ({
            id: parseInt(subjectId),
          })),
        }
      } : {})
    };
    
    await prisma.teacher.update({
      where: {
        id: data.id,
      },
      data: teacherData,
    });
    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};



export const deleteTeacher = async (
  currentState: CurrentState,
  data: FormData
) => {
  try {
    console.log('Delete teacher function received data:', Object.fromEntries(data.entries()));
    
    // Extract and validate ID
    const id = data.get("id");
    console.log('ID extracted from form data:', id, typeof id);
    
    if (!id || typeof id !== 'string') {
      console.error('Invalid ID received for teacher deletion:', id);
      return { 
        success: false, 
        error: true, 
        message: "Invalid teacher ID provided" 
      };
    }
    
    // First find the teacher to ensure it exists
    console.log('Finding teacher with ID:', id);
    const teacher = await prisma.teacher.findUnique({
      where: { id },
      include: { 
        classes: true,  // Check if supervising any classes
        lessons: true,  // Check if teaching any lessons
        subjects: true  // Check if teaching any subjects
      },
    });

    if (!teacher) {
      console.log('Teacher not found with ID:', id);
      return { success: false, error: true, message: "Teacher not found" };
    }
    
    console.log('Found teacher:', JSON.stringify(teacher, null, 2));

    // Check if teacher is supervising any classes - this is a blocker for deletion
    if (teacher.classes.length > 0) {
      console.log(`Teacher is supervising ${teacher.classes.length} classes, cannot delete`);
      return { 
        success: false, 
        error: true, 
        message: "Cannot delete teacher who is supervising classes. Please reassign classes first." 
      };
    }
    
    // Check if teacher has lessons - this is also a blocker for deletion since lessons require a teacher
    if (teacher.lessons.length > 0) {
      console.log(`Teacher has ${teacher.lessons.length} lessons, cannot delete`);
      return { 
        success: false, 
        error: true, 
        message: "Cannot delete teacher who is assigned to lessons. Please reassign or delete these lessons first." 
      };
    }
    
    // For subjects, we can remove the relationship without blocking deletion
    if (teacher.subjects.length > 0) {
      console.log(`Teacher has ${teacher.subjects.length} subjects assigned, disconnecting relationships`);
      // Disconnect the teacher from all subjects (many-to-many relationship)
      await prisma.teacher.update({
        where: { id },
        data: {
          subjects: {
            disconnect: teacher.subjects.map(subject => ({ id: subject.id }))
          }
        }
      });
      console.log('Disconnected teacher from all subjects');
    }

    // Delete from database
    console.log('Deleting teacher from database...');
    await prisma.teacher.delete({
      where: { id },
    });
    console.log('Teacher deleted from database successfully');

    try {
      console.log('Attempting to delete user from Clerk...');
      // Then try to delete from Clerk
      await (clerkClient as ClerkType).users.deleteUser(id);
      console.log('Clerk user deleted successfully');
    } catch (clerkError) {
      console.error('Error deleting Clerk user:', clerkError);
      // Continue even if Clerk deletion fails - the database record is gone
    }

    revalidatePath("/list/teachers");
    console.log('Delete teacher operation completed successfully');
    return { success: true, error: false };
  } catch (err) {
    console.error('Error deleting teacher:', err);
    
    let errorMessage = 'Failed to delete teacher';
    
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      errorMessage = `Database error (${err.code}): `;
      
      // Provide more specific error messages based on error code
      if (err.code === 'P2003') {
        errorMessage += 'This teacher has related records that prevent deletion. Please reassign their lessons or classes first.';
      } else if (err.code === 'P2025') {
        errorMessage += 'Teacher record not found.';
      } else if (err.code === 'P2018') {
        errorMessage += 'Required related record not found.';
      } else if (err.code === 'P2014' || err.code === 'P2016') {
        errorMessage += 'Cannot delete due to existing relationships. Please remove lessons and class supervision first.';
      } else {
        errorMessage += err.message;
      }
    } else if (err instanceof Error) {
      errorMessage += `: ${err.message}`;
    }
    
    console.error('Final error message:', errorMessage);
    
    return { 
      success: false, 
      error: true, 
      message: errorMessage
    };
  }
};

export const createStudent = async (
  currentState: CurrentState,
  data: StudentSchema
): Promise<{ success: boolean; error: boolean; message?: string }> => {
  console.log("Student creation data:", {
    username: data.username,
    name: data.name,
    surname: data.surname,
    email: data.email ? "provided" : "not provided",
    classId: data.classId,
    gradeId: data.gradeId
  });

  try {
    // Initialize Clerk client
    const clerk = await clerkClient();

    // First, verify the class exists and has capacity
    try {
      const classItem = await prisma.class.findUnique({
        where: { id: Number(data.classId) },
        include: { _count: { select: { students: true } } },
      });

      if (!classItem) {
        return { 
          success: false, 
          error: true, 
          message: "The selected class does not exist. Please select a valid class." 
        };
      }

      if (classItem.capacity <= classItem._count.students) {
        return { 
          success: false, 
          error: true, 
          message: "Class capacity has been reached. Please select a different class." 
        };
      }

      // Verify the grade exists
      const gradeExists = await prisma.grade.findUnique({
        where: { id: Number(data.gradeId) }
      });

      if (!gradeExists) {
        return { 
          success: false, 
          error: true, 
          message: "The selected grade does not exist. Please select a valid grade." 
        };
      }
    } catch (dbCheckError) {
      console.error("Error checking class/grade:", dbCheckError);
      return { 
        success: false, 
        error: true, 
        message: "Error verifying class and grade information. Please try again." 
      };
    }

    // Now create the Clerk user
    let user;
    try {
      user = await clerk.users.createUser({
        username: data.username,
        password: data.password,
        firstName: data.name,
        lastName: data.surname,
        ...(data.email ? { emailAddresses: [{ emailAddress: data.email }] } : {}),
        publicMetadata: { role: "student" }
      });
    } catch (clerkError: any) {
      console.error("Clerk API Error:", clerkError);
      
      // Extract specific details from Clerk error for better error messages
      if (clerkError?.errors && Array.isArray(clerkError.errors)) {
        for (const err of clerkError.errors) {
          if (err.code === "form_identifier_exists") {
            return { 
              success: false, 
              error: true, 
              message: "A user with this username already exists. Please choose a different username." 
            };
          }
          if (err.code === "form_password_pwned") {
            return { 
              success: false, 
              error: true, 
              message: "This password has been compromised in a data breach. Please choose a more secure password." 
            };
          }
          if (err.code === "form_password_validation_failed") {
            return { 
              success: false, 
              error: true, 
              message: "Password is too short. Please use at least 8 characters." 
            };
          }
        }
      }
      
      return { 
        success: false, 
        error: true, 
        message: "Error creating user account. Please try again with different credentials." 
      };
    }

    // If we got here, the Clerk user was created successfully
    // Now create the student in our database with a more direct approach
    try {
      // Create a simplified data object with the minimum required fields
      await prisma.student.create({
        data: {
          id: user.id,
          username: data.username,
          name: data.name,
          surname: data.surname,
          address: data.address,
          bloodType: data.bloodType,
          sex: data.sex,
          birthday: data.birthday,
          // Use direct IDs rather than connect for simplicity
          gradeId: Number(data.gradeId),
          classId: Number(data.classId),
          // Only add optional fields if they exist
          ...(data.email ? { email: data.email } : {}),
          ...(data.phone ? { phone: data.phone } : {}),
          ...(data.img ? { img: data.img } : {})
        }
      });

      return { 
        success: true, 
        error: false, 
        message: "Student created successfully." 
      };
    } catch (dbError: any) {
      console.error("Database error creating student:", dbError);
      
      // Clean up the Clerk user since database creation failed
      try {
        await clerk.users.deleteUser(user.id);
        console.log(`Cleaned up Clerk user ${user.id} after database error`);
      } catch (cleanupError) {
        console.error("Error cleaning up Clerk user:", cleanupError);
      }

      // Provide specific error messages based on the error code
      if (dbError.code === "P2002") {
        const field = dbError.meta && dbError.meta.target ? 
          String(dbError.meta.target[0]) : "field";
        return { 
          success: false, 
          error: true, 
          message: `A student with this ${field} already exists. Please use a different ${field}.` 
        };
      }
      
      return { 
        success: false, 
        error: true, 
        message: "Error saving student details to database. Please try again later." 
      };
    }
  } catch (err) {
    console.error("Unexpected error in student creation:", err);
    return { 
      success: false, 
      error: true, 
      message: "An unexpected error occurred. Please try again." 
    };
  }
};

export const updateStudent = async (
  currentState: CurrentState,
  data: StudentSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  
  try {
    // Type assertion to fix TS errors while maintaining functionality
    const user = await (clerkClient as ClerkType).users.getUser(data.id);
    await user.update({
      username: data.username,
      ...(data.password !== "" && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });

    // Create update data without the parentId field (since it's removed from the form)
    const updateData = {
      ...(data.password !== "" && { password: data.password }),
      username: data.username,
      name: data.name,
      surname: data.surname,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address,
      img: data.img || null,
      bloodType: data.bloodType,
      sex: data.sex,
      birthday: data.birthday,
      gradeId: data.gradeId,
      classId: data.classId,
      // parentId is now removed from student creation, but we keep it for existing students
    };

    await prisma.student.update({
      where: {
        id: data.id,
      },
      data: updateData,
    });
    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteStudent = async (
  currentState: CurrentState,
  data: FormData
) => {
  try {
    console.log('Delete student function received data:', Object.fromEntries(data.entries()));
    
    // Extract and validate ID
    const id = data.get("id");
    console.log('ID extracted from form data:', id, typeof id);
    
    if (!id || typeof id !== 'string') {
      console.error('Invalid ID received for student deletion:', id);
      return { 
        success: false, 
        error: true, 
        message: "Invalid student ID provided" 
      };
    }
    
    // First find the student to ensure it exists
    console.log('Finding student with ID:', id);
    const student = await prisma.student.findUnique({
      where: { id },
      include: { parent: true, results: true, attendances: true } // Include related records to check constraints
    });

    if (!student) {
      console.log('Student not found with ID:', id);
      return { success: false, error: true, message: "Student not found" };
    }
    
    console.log('Found student:', JSON.stringify(student, null, 2));

    // Delete related records first if needed
    if (student.results.length > 0) {
      console.log(`Deleting ${student.results.length} results for student`);
      await prisma.result.deleteMany({
        where: { studentId: id },
      });
    }
    
    if (student.attendances.length > 0) {
      console.log(`Deleting ${student.attendances.length} attendance records for student`);
      await prisma.attendance.deleteMany({
        where: { studentId: id },
      });
    }

    // Delete from database
    console.log('Deleting student from database...');
    await prisma.student.delete({
      where: { id },
    });
    console.log('Student deleted from database successfully');

    try {
      console.log('Attempting to delete user from Clerk...');
      // Then try to delete from Clerk
      await (clerkClient as ClerkType).users.deleteUser(id);
      console.log('Clerk user deleted successfully');
    } catch (clerkError) {
      console.error('Error deleting Clerk user:', clerkError);
      // Continue even if Clerk deletion fails - the database record is gone
    }

    revalidatePath("/list/students");
    console.log('Delete student operation completed successfully');
    return { success: true, error: false };
  } catch (err) {
    console.error('Error deleting student:', err);
    
    let errorMessage = 'Failed to delete student';
    
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      errorMessage = `Database error (${err.code}): `;
      
      // Provide more specific error messages based on error code
      if (err.code === 'P2003') {
        errorMessage += 'This student has related records that prevent deletion.';
      } else if (err.code === 'P2025') {
        errorMessage += 'Student record not found.';
      } else {
        errorMessage += err.message;
      }
    } else if (err instanceof Error) {
      errorMessage += `: ${err.message}`;
    }
    
    console.error('Final error message:', errorMessage);
    
    return { 
      success: false, 
      error: true, 
      message: errorMessage
    };
  }
};

export const createExam = async (
  currentState: CurrentState,
  data: ExamSchema
) => {
  // const { userId, sessionClaims } = auth();
  // const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    // if (role === "teacher") {
    //   const teacherLesson = await prisma.lesson.findFirst({
    //     where: {
    //       teacherId: userId!,
    //       id: data.lessonId,
    //     },
    //   });

    //   if (!teacherLesson) {
    //     return { success: false, error: true };
    //   }
    // }

    await prisma.exam.create({
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: data.lessonId,
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateExam = async (
  currentState: CurrentState,
  data: ExamSchema
) => {
  // const { userId, sessionClaims } = auth();
  // const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    // if (role === "teacher") {
    //   const teacherLesson = await prisma.lesson.findFirst({
    //     where: {
    //       teacherId: userId!,
    //       id: data.lessonId,
    //     },
    //   });

    //   if (!teacherLesson) {
    //     return { success: false, error: true };
    //   }
    // }

    await prisma.exam.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: data.lessonId,
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteExam = async (currentState: CurrentState, data: FormData) => {
  try {
    const id = parseInt(data.get("id") as string);
    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    if (!id) {
      return { success: false, error: true };
    }

    await prisma.exam.delete({
      where: {
        id,
        // ...(role === "teacher" ? { lesson: { teacherId: userId! } } : {}),
      },
    });

    revalidatePath("/list/exams");
    return { success: true, error: false };
  } catch (error) {
    console.log(error);
    return { success: false, error: true };
  }
};

// LESSON ACTIONS
export const createLesson = async (
  currentState: CurrentState,
  data: LessonSchema
) => {
  try {
    await prisma.lesson.create({
      data: {
        name: data.name,
        day: data.day as any, // Cast to any since the type might be a string in form but enum in DB
        startTime: data.startTime,
        endTime: data.endTime,
        classId: data.classId,
        subjectId: data.subjectId,
        teacherId: data.teacherId,
      },
    });

    revalidatePath("/list/lessons");
    return { success: true, error: false };
  } catch (error) {
    console.log(error);
    return { success: false, error: true };
  }
};

export const updateLesson = async (
  currentState: CurrentState,
  data: LessonSchema
) => {
  try {
    if (!data.id) {
      return { success: false, error: true };
    }

    await prisma.lesson.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        day: data.day as any, // Cast to any since the type might be a string in form but enum in DB
        startTime: data.startTime,
        endTime: data.endTime,
        classId: data.classId,
        subjectId: data.subjectId,
        teacherId: data.teacherId,
      },
    });

    revalidatePath("/list/lessons");
    return { success: true, error: false };
  } catch (error) {
    console.log(error);
    return { success: false, error: true };
  }
};

export const deleteLesson = async (currentState: CurrentState, data: FormData) => {
  try {
    const id = parseInt(data.get("id") as string);
    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    if (!id) {
      return { success: false, error: true };
    }

    await prisma.lesson.delete({
      where: {
        id,
        ...(role === "teacher" ? { teacherId: userId! } : {}),
      },
    });

    revalidatePath("/list/lessons");
    return { success: true, error: false };
  } catch (error) {
    console.log(error);
    return { success: false, error: true };
  }
};

// PARENT ACTIONS
export const createParent = async (
  currentState: CurrentState,
  data: ParentSchema
) => {
  try {
    // Initialize clerk client properly for Next.js 15
    const clerk = await clerkClient();
    
    let user;
    try {
      // Use the correct parameter structure for Clerk v5.7.5
      user = await clerk.users.createUser({
        username: data.username,
        password: data.password,
        firstName: data.name,
        lastName: data.surname,
        // Use the correct emailAddresses format as we did for teachers
        ...(data.email ? { emailAddresses: [{ emailAddress: data.email }] } : {}),
        publicMetadata: { role: "parent" } // Changed from privateMetadata to be consistent
      });
    } catch (clerkError: any) {
      console.error("Clerk API Error details:", clerkError);
      
      // Extract specific details from Clerk error for better debugging
      console.error("Clerk Error Status:", clerkError?.status);
      console.error("Clerk Error Trace ID:", clerkError?.clerkTraceId);
      console.error("Clerk Errors:", clerkError?.errors);
      
      // More user-friendly error message based on common Clerk errors
      let errorMessage = "Something went wrong while creating the parent account.";
      
      if (clerkError?.errors && Array.isArray(clerkError.errors)) {
        const errors = clerkError.errors.map((err: any) => ({
          code: err.code,
          message: err.message,
          longMessage: err.longMessage
        }));
        
        console.error("Detailed Clerk errors:", JSON.stringify(errors, null, 2));
        
        // Check for common errors and provide better messages
        if (errors.some((e: any) => e.code === "form_password_pwned")) {
          errorMessage = "This password has been compromised in a data breach. Please choose a stronger password.";
        } else if (errors.some((e: any) => e.code === "form_identifier_exists")) {
          errorMessage = "A parent with this username or email already exists.";
        } else if (errors.some((e: any) => e.code === "form_password_length_too_short")) {
          errorMessage = "Password is too short. Please use at least 8 characters.";
        }
      }
      
      return { success: false, error: true, message: errorMessage };
    }
    
    if (!user) {
      return { success: false, error: true, message: "Failed to create parent account with Clerk." };
    }

    // Create the parent in our database
    try {
      await prisma.parent.create({
        data: {
          id: user.id,
          username: data.username,
          name: data.name,
          surname: data.surname,
          email: data.email || null, // Changed from undefined to null for consistency
          phone: data.phone,
          address: data.address,
        },
      });
      
      revalidatePath("/list/parents");
      return { success: true, error: false, message: "Parent account created successfully." };
    } catch (dbError) {
      console.error("Database error creating parent:", dbError);
      
      // If there was a DB error but we already created the Clerk user, we should handle this
      // In a production system, you might want to delete the Clerk user or implement a cleanup process
      return { success: false, error: true, message: "Error saving parent details to database. Please contact support." };
    }
  } catch (error) {
    console.log(error);
    return { success: false, error: true };
  }
};

export const updateParent = async (
  currentState: CurrentState,
  data: ParentSchema
) => {
  try {
    if (!data.id) {
      return { success: false, error: true };
    }

    // Update parent in Clerk
    // Get user from Clerk
    // Type assertion to fix TS errors while maintaining functionality
    const user = await (clerkClient as ClerkType).users.getUser(data.id);
    await user.update({
      username: data.username,
      ...(data.password !== "" && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
      emailAddresses: data.email ? [{ email: data.email }] : undefined,
    });

    // Update parent in our database
    await prisma.parent.update({
      where: {
        id: data.id,
      },
      data: {
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone,
        address: data.address,
      },
    });

    revalidatePath("/list/parents");
    return { success: true, error: false };
  } catch (error) {
    console.log(error);
    return { success: false, error: true };
  }
};

export const deleteParent = async (currentState: CurrentState, data: FormData) => {
  try {
    console.log('Delete parent function received data:', Object.fromEntries(data.entries()));
    
    // Extract and validate ID
    const id = data.get("id");
    console.log('ID extracted from form data:', id, typeof id);
    
    if (!id || typeof id !== 'string') {
      console.error('Invalid ID received for parent deletion:', id);
      return { 
        success: false, 
        error: true, 
        message: "Invalid parent ID provided" 
      };
    }
    
    // Verify admin role
    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    if (role !== "admin") {
      console.log('Unauthorized deletion attempt by non-admin role:', role);
      return { success: false, error: true, message: "Only admins can delete parents" };
    }

    // First find the parent to ensure it exists
    console.log('Finding parent with ID:', id);
    const parent = await prisma.parent.findUnique({
      where: { id },
      include: { students: true },
    });

    if (!parent) {
      console.log('Parent not found with ID:', id);
      return { success: false, error: true, message: "Parent not found" };
    }
    
    console.log('Found parent:', JSON.stringify(parent, null, 2));

    // Check if parent has any linked students
    if (parent.students.length > 0) {
      console.log(`Parent has ${parent.students.length} students linked, cannot delete`);
      return { 
        success: false, 
        error: true, 
        message: "Cannot delete parent with linked students. Please unlink or reassign students first." 
      };
    }

    // Delete from database
    console.log('Deleting parent from database...');
    await prisma.parent.delete({
      where: { id },
    });
    console.log('Parent deleted from database successfully');

    try {
      console.log('Attempting to delete user from Clerk...');
      // Then try to delete from Clerk
      await (clerkClient as ClerkType).users.deleteUser(id);
      console.log('Clerk user deleted successfully');
    } catch (clerkError) {
      console.error('Error deleting Clerk user:', clerkError);
      // Continue even if Clerk deletion fails - the database record is gone
    }

    revalidatePath("/list/parents");
    console.log('Delete parent operation completed successfully');
    return { success: true, error: false };
  } catch (err) {
    console.error('Error deleting parent:', err);
    
    let errorMessage = 'Failed to delete parent';
    
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      errorMessage = `Database error (${err.code}): `;
      
      // Provide more specific error messages based on error code
      if (err.code === 'P2003') {
        errorMessage += 'This parent has related records that prevent deletion. Please reassign or remove students first.';
      } else if (err.code === 'P2025') {
        errorMessage += 'Parent record not found.';
      } else {
        errorMessage += err.message;
      }
    } else if (err instanceof Error) {
      errorMessage += `: ${err.message}`;
    }
    
    console.error('Final error message:', errorMessage);
    
    return { 
      success: false, 
      error: true, 
      message: errorMessage
    };
  }
};

// EVENT ACTIONS
export const createEvent = async (
  currentState: CurrentState,
  data: EventSchema
) => {
  try {
    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    if (!userId) {
      return { success: false, error: true };
    }

    await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        ...(data.classId ? { classId: data.classId } : {}),
      },
    });

    revalidatePath("/list/events");
    return { success: true, error: false };
  } catch (error) {
    console.log(error);
    return { success: false, error: true };
  }
};

export const updateEvent = async (
  currentState: CurrentState,
  data: EventSchema
) => {
  try {
    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    if (!userId || !data.id) {
      return { success: false, error: true };
    }

    await prisma.event.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        ...(data.classId ? { classId: data.classId } : { classId: null }),
      },
    });

    revalidatePath("/list/events");
    return { success: true, error: false };
  } catch (error) {
    console.log(error);
    return { success: false, error: true };
  }
};

export const deleteEvent = async (currentState: CurrentState, data: FormData) => {
  try {
    const id = parseInt(data.get("id") as string);
    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    if (!id || (role !== "admin" && role !== "teacher")) {
      return { success: false, error: true };
    }

    await prisma.event.delete({
      where: {
        id,
      },
    });

    revalidatePath("/list/events");
    return { success: true, error: false };
  } catch (error) {
    console.log(error);
    return { success: false, error: true };
  }
};

// ASSIGNMENT ACTIONS
export const createAssignment = async (
  currentState: CurrentState,
  data: AssignmentSchema
) => {
  try {
    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    if (!userId || (role !== "admin" && role !== "teacher")) {
      return { success: false, error: true };
    }

    await prisma.assignment.create({
      data: {
        title: data.title,
        startDate: data.startDate,
        dueDate: data.dueDate,
        lessonId: data.lessonId,
      },
    });

    revalidatePath("/list/assignments");
    return { success: true, error: false };
  } catch (error) {
    console.log(error);
    return { success: false, error: true };
  }
};

export const updateAssignment = async (
  currentState: CurrentState,
  data: AssignmentSchema
) => {
  try {
    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    if (!userId || !data.id || (role !== "admin" && role !== "teacher")) {
      return { success: false, error: true };
    }

    await prisma.assignment.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        startDate: data.startDate,
        dueDate: data.dueDate,
        lessonId: data.lessonId,
      },
    });

    revalidatePath("/list/assignments");
    return { success: true, error: false };
  } catch (error) {
    console.log(error);
    return { success: false, error: true };
  }
};

export const deleteAssignment = async (currentState: CurrentState, data: FormData) => {
  try {
    const id = parseInt(data.get("id") as string);
    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    if (!id || (role !== "admin" && role !== "teacher")) {
      return { success: false, error: true };
    }

    await prisma.assignment.delete({
      where: {
        id,
      },
    });

    revalidatePath("/list/assignments");
    return { success: true, error: false };
  } catch (error) {
    console.log(error);
    return { success: false, error: true };
  }
};

// RESULT ACTIONS
export const createResult = async (
  currentState: CurrentState,
  data: ResultSchema
) => {
  try {
    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    if (!userId || (role !== "admin" && role !== "teacher")) {
      return { success: false, error: true };
    }

    await prisma.result.create({
      data: {
        score: data.score,
        studentId: data.studentId,
        ...(data.examId ? { examId: data.examId } : {}),
        ...(data.assignmentId ? { assignmentId: data.assignmentId } : {}),
      },
    });

    revalidatePath("/list/results");
    return { success: true, error: false };
  } catch (error) {
    console.log(error);
    return { success: false, error: true };
  }
};

export const updateResult = async (
  currentState: CurrentState,
  data: ResultSchema
) => {
  try {
    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    if (!userId || !data.id || (role !== "admin" && role !== "teacher")) {
      return { success: false, error: true };
    }

    await prisma.result.update({
      where: {
        id: data.id,
      },
      data: {
        score: data.score,
        studentId: data.studentId,
        examId: data.examId || null,
        assignmentId: data.assignmentId || null,
      },
    });

    revalidatePath("/list/results");
    return { success: true, error: false };
  } catch (error) {
    console.log(error);
    return { success: false, error: true };
  }
};

export const deleteResult = async (currentState: CurrentState, data: FormData) => {
  try {
    const id = parseInt(data.get("id") as string);
    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    if (!id || (role !== "admin" && role !== "teacher")) {
      return { success: false, error: true };
    }

    await prisma.result.delete({
      where: {
        id,
      },
    });

    revalidatePath("/list/results");
    return { success: true, error: false };
  } catch (error) {
    console.log(error);
    return { success: false, error: true };
  }
};
