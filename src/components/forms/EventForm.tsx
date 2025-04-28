"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { eventSchema, EventSchema } from "@/lib/formValidationSchemas";
import { useActionState } from "react";
import { createEvent, updateEvent } from "@/lib/actions";
import { Dispatch, SetStateAction, useEffect, useState, useTransition } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const EventForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: { classes?: any[] };
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<EventSchema>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      startTime: data?.startTime ? new Date(data.startTime) : new Date(),
      endTime: data?.endTime ? new Date(data.endTime) : new Date(Date.now() + 60 * 60 * 1000),
    },
  });

  // Use the new React API in Next.js 15
  const [isPending, startTransition] = useTransition();
  
  const [state, formAction] = useActionState(
    type === "create" ? createEvent : updateEvent,
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
      toast(`Event has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new event" : "Update the event"}
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
          <label className="text-xs text-gray-500">Description</label>
          <textarea
            className="border border-gray-300 rounded-md p-2 text-sm"
            rows={4}
            {...register("description")}
            defaultValue={data?.description}
          />
          {errors.description && (
            <span className="text-red-500 text-xs">
              {errors.description.message as string}
            </span>
          )}
        </div>
        <div className="flex gap-4 flex-wrap">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Start Time</label>
            <input
              type="datetime-local"
              className="border border-gray-300 rounded-md p-2 text-sm"
              {...register("startTime")}
              defaultValue={
                data?.startTime
                  ? new Date(data.startTime).toISOString().slice(0, 16)
                  : new Date().toISOString().slice(0, 16)
              }
            />
            {errors.startTime && (
              <span className="text-red-500 text-xs">
                {errors.startTime.message as string}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">End Time</label>
            <input
              type="datetime-local"
              className="border border-gray-300 rounded-md p-2 text-sm"
              {...register("endTime")}
              defaultValue={
                data?.endTime
                  ? new Date(data.endTime).toISOString().slice(0, 16)
                  : new Date(Date.now() + 60 * 60 * 1000)
                      .toISOString()
                      .slice(0, 16)
              }
            />
            {errors.endTime && (
              <span className="text-red-500 text-xs">
                {errors.endTime.message as string}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Associated Class (Optional)</label>
          <select
            className="border border-gray-300 rounded-md p-2 text-sm"
            {...register("classId")}
            defaultValue={data?.classId || ""}
          >
            <option value="">No specific class</option>
            {relatedData?.classes?.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
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

export default EventForm;
