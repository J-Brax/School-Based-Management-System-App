"use client";

import {
  deleteClass,
  deleteExam,
  deleteStudent,
  deleteSubject,
  deleteTeacher,
  deleteParent,
  deleteLesson,
  deleteAssignment,
  deleteResult,
  deleteEvent,
} from "@/lib/actions";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useActionState } from "react";
import { toast } from "react-toastify";
import { FormContainerProps } from "./FormContainer";

const deleteActionMap = {
  subject: deleteSubject,
  class: deleteClass,
  teacher: deleteTeacher,
  student: deleteStudent,
  exam: deleteExam,
  parent: deleteParent,
  lesson: deleteLesson,
  assignment: deleteAssignment,
  result: deleteResult,
  event: deleteEvent,
  // Comment out non-implemented actions rather than mapping to wrong function
  // attendance: null, // Not implemented yet
  // announcement: null, // Not implemented yet
};

// USE LAZY LOADING

// import TeacherForm from "./forms/TeacherForm";
// import StudentForm from "./forms/StudentForm";

const TeacherForm = dynamic(() => import("./forms/TeacherForm"), {
  loading: () => <h1>Loading...</h1>,
});
const StudentForm = dynamic(() => import("./forms/StudentForm"), {
  loading: () => <h1>Loading...</h1>,
});
const SubjectForm = dynamic(() => import("./forms/SubjectForm"), {
  loading: () => <h1>Loading...</h1>,
});
const ClassForm = dynamic(() => import("./forms/ClassForm"), {
  loading: () => <h1>Loading...</h1>,
});
const ExamForm = dynamic(() => import("./forms/ExamForm"), {
  loading: () => <h1>Loading...</h1>,
});
const LessonForm = dynamic(() => import("./forms/LessonForm"), {
  loading: () => <h1>Loading...</h1>,
});
const ParentForm = dynamic(() => import("./forms/ParentForm"), {
  loading: () => <h1>Loading...</h1>,
});
const EventForm = dynamic(() => import("./forms/EventForm"), {
  loading: () => <h1>Loading...</h1>,
});
const AssignmentForm = dynamic(() => import("./forms/AssignmentForm"), {
  loading: () => <h1>Loading...</h1>,
});
const ResultForm = dynamic(() => import("./forms/ResultForm"), {
  loading: () => <h1>Loading...</h1>,
});
// Create a proper fallback component with the correct props
const AnnouncementFormFallback = ({ type, data, setOpen, relatedData }: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) => (
  <div className="p-4">
    <h3 className="text-lg font-medium mb-4">Announcement Form</h3>
    <p>This form is being prepared. Please try again in a moment.</p>
  </div>
);

// Set a display name to fix the ESLint warning
AnnouncementFormFallback.displayName = "AnnouncementFormFallback";

// Create a wrapper component that matches the expected interface
const AnnouncementFormWrapper = dynamic(
  () => import("./forms/AnnouncementForm")
    .then(mod => mod.default)
    .catch(err => {
      console.error('Failed to load AnnouncementForm:', err);
      return AnnouncementFormFallback;
    }),
  {
    loading: () => <div className="p-4">Loading announcement form...</div>,
    ssr: false
  }
);

// Add display name to help with debugging
AnnouncementFormWrapper.displayName = "AnnouncementFormWrapper";

const forms: {
  [key: string]: (
    setOpen: Dispatch<SetStateAction<boolean>>,
    type: "create" | "update",
    data?: any,
    relatedData?: any
  ) => JSX.Element;
} = {
  subject: (setOpen, type, data, relatedData) => (
    <SubjectForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  class: (setOpen, type, data, relatedData) => (
    <ClassForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  teacher: (setOpen, type, data, relatedData) => (
    <TeacherForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  student: (setOpen, type, data, relatedData) => (
    <StudentForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  exam: (setOpen, type, data, relatedData) => (
    <ExamForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  lesson: (setOpen, type, data, relatedData) => (
    <LessonForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  parent: (setOpen, type, data, relatedData) => (
    <ParentForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  event: (setOpen, type, data, relatedData) => (
    <EventForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  assignment: (setOpen, type, data, relatedData) => (
    <AssignmentForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  result: (setOpen, type, data, relatedData) => (
    <ResultForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  announcement: (setOpen, type, data, relatedData) => (
    <AnnouncementFormWrapper
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  // TODO OTHER LIST ITEMS
};

const FormModal = ({
  table,
  type,
  data,
  id,
  relatedData,
}: FormContainerProps & { relatedData?: any }) => {
  const size = type === "create" ? "w-8 h-8" : "w-7 h-7";
  const bgColor =
    type === "create"
      ? "bg-lamaYellow"
      : type === "update"
      ? "bg-lamaSky"
      : "bg-lamaPurple";

  const [open, setOpen] = useState(false);

  const Form = () => {
    const router = useRouter();
    
    // Check if the delete action exists for this table type
    const deleteAction = deleteActionMap[table as keyof typeof deleteActionMap];
    
    // Create a client action that will trigger the server action
    const handleDelete = async (formData: FormData) => {
      try {
        // Enhanced client-side debugging
        console.log(`[DELETE DEBUG] Started deletion for ${table} with ID:`, id);
        console.log(`[DELETE DEBUG] Type of ID:`, typeof id);
        
        if (!deleteAction) {
          console.error(`[DELETE DEBUG] No delete action implemented for ${table}`);
          toast.error(`Delete action not implemented for ${table}`);
          return;
        }
        
        // Make sure ID is added to the form data
        formData.set('id', id!.toString());
        
        // Log form data for debugging
        console.log('[DELETE DEBUG] Form data entries:', [...formData.entries()]);
        console.log(`[DELETE DEBUG] Using action:`, deleteAction.name || 'unnamed function');
        
        // Call the server action directly
        console.log('[DELETE DEBUG] Calling server action...');
        const result = await deleteAction({success: false, error: false}, formData);
        console.log('[DELETE DEBUG] Delete result:', result);
        
        if (result.success) {
          console.log('[DELETE DEBUG] Delete operation successful');
          toast.success(`${table} has been deleted!`);
          setOpen(false);
          router.refresh();
        } else if (result.error && 'message' in result && result.message) {
          console.error('[DELETE DEBUG] Server returned error:', result.message);
          toast.error(result.message as string);
        } else {
          console.error('[DELETE DEBUG] Server returned unknown error state:', result);
          toast.error(`Failed to delete ${table} due to an unknown error.`);
        }
      } catch (error) {
        console.error('[DELETE DEBUG] Exception during delete operation:', error);
        toast.error(`Failed to delete ${table}. Please try again.`);
      }
    };

    // State for storing error message from delete operation
    const [deleteError, setDeleteError] = useState<string | null>(null);
    
    // Direct delete handler function without form wrapper
    const directDeleteHandler = async () => {
      try {
        // Clear any previous errors
        setDeleteError(null);
        console.log('[DELETE DEBUG] Direct delete handler triggered for', table, 'with ID:', id);
        
        if (!deleteAction) {
          console.error(`[DELETE DEBUG] No delete action implemented for ${table}`);
          setDeleteError(`Delete action not implemented for ${table}`);
          toast.error(`Delete action not implemented for ${table}`);
          return;
        }
        
        // Create form data manually
        const formData = new FormData();
        formData.append('id', id?.toString() || '');
        
        console.log('[DELETE DEBUG] Form data created manually:', [...formData.entries()]);
        console.log(`[DELETE DEBUG] Calling ${deleteAction.name || 'unnamed'} action directly...`);
        
        // Call server action
        const result = await deleteAction({success: false, error: false}, formData);
        console.log('[DELETE DEBUG] Delete result:', result);
        
        if (result.success) {
          console.log('[DELETE DEBUG] Delete operation successful');
          toast.success(`${table} has been deleted!`);
          setOpen(false);
          router.refresh();
        } else if (result.error && 'message' in result && result.message) {
          console.error('[DELETE DEBUG] Server returned error:', result.message);
          setDeleteError(result.message as string);
          toast.error(result.message as string);
        } else {
          console.error('[DELETE DEBUG] Server returned unknown error state:', result);
          setDeleteError(`Failed to delete ${table} due to an unknown error.`);
          toast.error(`Failed to delete ${table} due to an unknown error.`);
        }
      } catch (error) {
        console.error('[DELETE DEBUG] Exception during direct delete:', error);
        setDeleteError(`An unexpected error occurred. Please try again.`);
        toast.error(`Failed to delete ${table}. Please try again.`);
      }
    };
    
    return type === "delete" && id ? (
      <div className="p-4 flex flex-col gap-4">
        <span className="text-center font-medium">
          All data will be lost. Are you sure you want to delete this {table}?
        </span>
        
        {/* Display error message when present */}
        {deleteError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-2">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {/* Warning icon */}
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-700">Delete Failed</h3>
                <div className="mt-1 text-sm text-red-600">
                  {deleteError}
                </div>
                {/* Render specific help message for teacher deletion constraints */}
                {table === 'teacher' && deleteError.includes('supervising classes') && (
                  <div className="mt-2 text-sm text-red-600">
                    <p className="font-semibold">How to fix:</p>
                    <ol className="list-decimal pl-5 mt-1">
                      <li>Go to the Classes list</li>
                      <li>Edit each class that has this teacher as supervisor</li>
                      <li>Assign a different teacher or set to &ldquo;No Supervisor&rdquo;</li>
                      <li>Return here and try deleting again</li>
                    </ol>
                  </div>
                )}
                {table === 'teacher' && deleteError.includes('assigned to lessons') && (
                  <div className="mt-2 text-sm text-red-600">
                    <p className="font-semibold">How to fix:</p>
                    <ol className="list-decimal pl-5 mt-1">
                      <li>Go to the Lessons list</li>
                      <li>Either delete or reassign lessons taught by this teacher</li>
                      <li>Return here and try deleting again</li>
                    </ol>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-center">
          <button 
            type="button" 
            className="bg-red-700 text-white py-2 px-4 rounded-md border-none hover:bg-red-800 transition-colors"
            onClick={directDeleteHandler}
          >
            Delete
          </button>
        </div>
      </div>
    ) : type === "create" || type === "update" ? (
      forms[table](setOpen, type, data, relatedData)
    ) : (
      "Form not found!"
    );
  };

  return (
    <>
      <button
        className={`${size} flex items-center justify-center rounded-full ${bgColor}`}
        onClick={() => setOpen(true)}
        aria-label={`${type} ${table}`}
      >
        <Image src={`/${type}.png`} alt={`${type} icon`} width={16} height={16} />
      </button>
      {open && (
        <div className="w-screen h-screen absolute left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center overflow-hidden">
          <div className="bg-white p-4 rounded-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%] max-h-[90vh] overflow-y-auto">
            <Form />
            <button
              className="absolute top-4 right-4 cursor-pointer border-none bg-transparent p-0"
              onClick={() => setOpen(false)}
              aria-label="Close form"
            >
              <Image src="/close.png" alt="Close" width={14} height={14} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FormModal;
