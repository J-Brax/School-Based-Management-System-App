"use client";

import React, { useState, Dispatch, SetStateAction, useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import InputField from "../InputField";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

// Define props interface for the form
export interface AnnouncementFormProps {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}

// Define the announcement schema if it doesn't exist elsewhere
const announcementSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, { message: "Title is required" }),
  content: z.string().min(1, { message: "Content is required" }),
  date: z.date().default(() => new Date()),
  author: z.string().optional(),
});

// Define the form data type
type AnnouncementFormData = z.infer<typeof announcementSchema>;

// Server actions for announcements - temporary placeholders
// These will be moved to actions.ts in the future
const createAnnouncement = async (data: AnnouncementFormData) => {
  // This is a placeholder - replace with actual implementation
  console.log("Creating announcement:", data);
  return { success: true, error: false, message: "Announcement created successfully" };
};

const updateAnnouncement = async (data: AnnouncementFormData) => {
  // This is a placeholder - replace with actual implementation
  console.log("Updating announcement:", data);
  return { success: true, error: false, message: "Announcement updated successfully" };
};

const AnnouncementForm: React.FC<AnnouncementFormProps> = ({ type, data, setOpen, relatedData }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: data?.title || "",
      content: data?.content || "",
      date: data?.date ? new Date(data.date) : new Date(),
      author: data?.author || "",
    },
  });

  // Use the new React API in Next.js 15
  const [isPending, startTransition] = useTransition();
  
  // Use a simple state instead of useActionState since we don't have proper server actions yet
  const [state, setState] = useState({
    success: false,
    error: false,
    message: "",
    isSubmitting: false
  });

  const onSubmit = handleSubmit((data) => {
    setState(prev => ({ ...prev, isSubmitting: true }));
    
    startTransition(async () => {
      try {
        // Call the appropriate function based on type
        const result = type === "create" 
          ? await createAnnouncement(data)
          : await updateAnnouncement(data);
          
        setState({
          success: result.success,
          error: result.error,
          message: result.message,
          isSubmitting: false
        });
      } catch (error) {
        console.error("Error creating/updating announcement:", error);
        setState({
          success: false,
          error: true,
          message: "An unexpected error occurred",
          isSubmitting: false
        });
      }
    });
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast.success(`Announcement has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state.success, router, setOpen, type]);

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {type === "update" && (
        <input type="hidden" {...register("id")} value={data.id} />
      )}
      <div className="w-full flex gap-4">
        <div className="flex-1">
          <InputField
            label="Title"
            name="title"
            placeholder="Announcement Title"
            type="text"
            register={register}
            error={errors.title}
          />
        </div>
      </div>
      <div className="w-full flex gap-4">
        <div className="flex-1">
          <InputField
            label="Author"
            name="author"
            placeholder="Announcement Author"
            type="text"
            register={register}
            error={errors.author}
          />
        </div>
      </div>
      <div className="w-full flex gap-4">
        <div className="flex-1">
          <label className="block mb-2 text-sm font-medium">Date</label>
          <input
            type="datetime-local"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            {...register("date", {
              setValueAs: (value) => new Date(value),
            })}
          />
          {errors.date && <span className="text-red-500">{errors.date.message}</span>}
        </div>
      </div>
      <div className="w-full">
        <label className="block mb-2 text-sm font-medium">Content</label>
        <textarea
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 min-h-[150px]"
          placeholder="Announcement content..."
          {...register("content")}
        />
        {errors.content && <span className="text-red-500">{errors.content.message}</span>}
      </div>
      {state.error && (
        <div className="bg-red-50 p-3 rounded-md border border-red-200">
          <span className="text-red-500 font-medium">Error: </span>
          <span className="text-red-500">
            {state.message || "Something went wrong! Please try again."}
          </span>
        </div>
      )}
      <button 
        type="submit" 
        disabled={isPending}
        className="bg-blue-400 text-white p-2 rounded-md disabled:bg-blue-300 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {type === "create" ? "Creating..." : "Updating..."}
          </span>
        ) : (
          <>{type === "create" ? "Create" : "Update"}</>
        )}
      </button>
    </form>
  );
};

// Add display name for better debugging
AnnouncementForm.displayName = 'AnnouncementForm';

export default AnnouncementForm;
