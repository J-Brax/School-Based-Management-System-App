"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { assignmentSchema, AssignmentSchema } from "@/lib/formValidationSchemas";
import { useActionState } from "react";
import { createAssignment, updateAssignment } from "@/lib/actions";
import { Dispatch, SetStateAction, useEffect, useTransition } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const AssignmentForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: { lessons?: any[] };
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AssignmentSchema>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      startDate: data?.startDate ? new Date(data.startDate) : new Date(),
      dueDate: data?.dueDate ? new Date(data.dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default due date 1 week later
    },
  });

  // Use the new React API in Next.js 15
  const [isPending, startTransition] = useTransition();
  
  const [state, formAction] = useActionState(
    type === "create" ? createAssignment : updateAssignment,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit((data) => {
    startTransition(() => {
      formAction(data);
    });
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Assignment has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new assignment" : "Update the assignment"}
      </h1>
      <div className="flex flex-col gap-4">
        <InputField
          label="Title"
          name="title"
          defaultValue={data?.title}
          register={register}
          error={errors?.title}
        />
        
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Lesson</label>
          <select
            className="border border-gray-300 rounded-md p-2 text-sm"
            {...register("lessonId")}
            defaultValue={data?.lessonId || ""}
          >
            <option value="" disabled>
              Select a lesson
            </option>
            {relatedData?.lessons?.map((lesson: any) => (
              <option key={lesson.id} value={lesson.id}>
                {lesson.name}
              </option>
            ))}
          </select>
          {errors.lessonId && (
            <span className="text-red-500 text-xs">
              {errors.lessonId.message as string}
            </span>
          )}
        </div>
        
        <div className="flex gap-4 flex-wrap">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Start Date</label>
            <input
              type="datetime-local"
              className="border border-gray-300 rounded-md p-2 text-sm"
              {...register("startDate")}
              defaultValue={
                data?.startDate
                  ? new Date(data.startDate).toISOString().slice(0, 16)
                  : new Date().toISOString().slice(0, 16)
              }
            />
            {errors.startDate && (
              <span className="text-red-500 text-xs">
                {errors.startDate.message as string}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Due Date</label>
            <input
              type="datetime-local"
              className="border border-gray-300 rounded-md p-2 text-sm"
              {...register("dueDate")}
              defaultValue={
                data?.dueDate
                  ? new Date(data.dueDate).toISOString().slice(0, 16)
                  : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                      .toISOString()
                      .slice(0, 16)
              }
            />
            {errors.dueDate && (
              <span className="text-red-500 text-xs">
                {errors.dueDate.message as string}
              </span>
            )}
          </div>
        </div>
      </div>
      {data && (
        <InputField
          label="Id"
          name="id"
          defaultValue={data?.id}
          register={register}
          error={errors?.id}
          hidden
        />
      )}
      {state.error && (
        <span className="text-red-500">Something went wrong!</span>
      )}
      <button className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default AssignmentForm;
