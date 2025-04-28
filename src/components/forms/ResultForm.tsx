"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { resultSchema, ResultSchema } from "@/lib/formValidationSchemas";
import { useActionState } from "react";
import { createResult, updateResult } from "@/lib/actions";
import { Dispatch, SetStateAction, useEffect, useTransition } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const ResultForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: { students?: any[]; exams?: any[]; assignments?: any[] };
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResultSchema>({
    resolver: zodResolver(resultSchema),
  });

  // Use the new React API in Next.js 15
  const [isPending, startTransition] = useTransition();
  
  const [state, formAction] = useActionState(
    type === "create" ? createResult : updateResult,
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

  const examId = watch("examId");
  const assignmentId = watch("assignmentId");

  useEffect(() => {
    if (state.success) {
      toast(`Result has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new result" : "Update the result"}
      </h1>
      <div className="flex flex-col gap-4">
        {/* Score input */}
        <InputField
          label="Score (0-100)"
          name="score"
          type="number"
          defaultValue={data?.score}
          register={register}
          error={errors?.score}
        />

        {/* Student selection */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Student</label>
          <select
            className="border border-gray-300 rounded-md p-2 text-sm"
            {...register("studentId")}
            defaultValue={data?.studentId || ""}
          >
            <option value="" disabled>
              Select a student
            </option>
            {relatedData?.students?.map((student: any) => (
              <option key={student.id} value={student.id}>
                {student.name} {student.surname}
              </option>
            ))}
          </select>
          {errors.studentId && (
            <span className="text-red-500 text-xs">
              {errors.studentId.message as string}
            </span>
          )}
        </div>

        {/* Exam selection */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Exam (Optional)</label>
          <select
            className="border border-gray-300 rounded-md p-2 text-sm"
            {...register("examId")}
            defaultValue={data?.examId || ""}
            disabled={!!assignmentId}
          >
            <option value="">No exam</option>
            {relatedData?.exams?.map((exam: any) => (
              <option key={exam.id} value={exam.id}>
                {exam.title}
              </option>
            ))}
          </select>
          {errors.examId && (
            <span className="text-red-500 text-xs">
              {errors.examId.message as string}
            </span>
          )}
        </div>

        {/* Assignment selection */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Assignment (Optional)</label>
          <select
            className="border border-gray-300 rounded-md p-2 text-sm"
            {...register("assignmentId")}
            defaultValue={data?.assignmentId || ""}
            disabled={!!examId}
          >
            <option value="">No assignment</option>
            {relatedData?.assignments?.map((assignment: any) => (
              <option key={assignment.id} value={assignment.id}>
                {assignment.title}
              </option>
            ))}
          </select>
          {errors.assignmentId && (
            <span className="text-red-500 text-xs">
              {errors.assignmentId.message as string}
            </span>
          )}
        </div>

        {examId && assignmentId && (
          <span className="text-red-500 text-xs">
            A result can be associated with either an exam or an assignment, not
            both.
          </span>
        )}
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

      <button 
        className="bg-blue-400 text-white p-2 rounded-md"
        disabled={!!examId && !!assignmentId}
      >
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default ResultForm;
