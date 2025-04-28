"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useState, useTransition } from "react";
import { teacherSchema, TeacherSchema } from "@/lib/formValidationSchemas";
import { useActionState } from "react";
import { createTeacher, updateTeacher } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { CldUploadWidget } from "next-cloudinary";

const TeacherForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TeacherSchema>({
    resolver: zodResolver(teacherSchema),
  });

  const [img, setImg] = useState<any>();
  const [isPending, startTransition] = useTransition();

  // Replace useActionState with a simple state for error handling
  const [state, setState] = useState({
    success: false,
    error: false,
    message: "",
    isSubmitting: false
  });

  const onSubmit = handleSubmit((data) => {
    console.log('Form data being submitted:', data);
    // Make a copy of the data to avoid modifying the original
    const formData = { ...data };
    
    // Add the image if available
    if (img?.secure_url) {
      formData.img = img.secure_url;
    }
    
    // Ensure email is properly formatted
    if (formData.email && !formData.email.includes('@')) {
      toast.error('Email must include @ symbol');
      return;
    }
    
    // Check password length
    if (formData.password && formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    
    // Try to submit the form directly using the server action
    setState(prev => ({ ...prev, isSubmitting: true, error: false, message: "" }));
    
    startTransition(async () => {
      try {
        // Call the server action directly
        const result = await createTeacher({ success: false, error: false }, formData);
        
        if (result.success) {
          setState(prev => ({ ...prev, success: true, isSubmitting: false }));
        } else {
          setState(prev => ({ 
            ...prev, 
            error: true, 
            isSubmitting: false, 
            message: result.message || "An unknown error occurred"
          }));
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        setState(prev => ({ 
          ...prev, 
          error: true, 
          isSubmitting: false, 
          message: "Failed to create teacher. Please try again."
        }));
      }
    });
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast.success(`Teacher has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state.success, router, setOpen, type]);

  const { subjects } = relatedData;

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new teacher" : "Update the teacher"}
      </h1>
      <span className="text-xs text-gray-400 font-medium">
        Authentication Information
      </span>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Username"
          name="username"
          defaultValue={data?.username}
          register={register}
          error={errors?.username}
        />
        {errors?.username ? (
          <p className="text-xs text-red-400 mt-1">
            {errors.username.message?.toString() || "Username must be unique and 3-20 characters"}
          </p>
        ) : (
          <p className="text-xs text-gray-400 mt-1">
            Username must be unique and 3-20 characters
          </p>
        )}
        <InputField
          label="Email"
          name="email"
          defaultValue={data?.email}
          register={register}
          error={errors?.email}
        />
        {errors?.email ? (
          <p className="text-xs text-red-400 mt-1">
            {errors.email.message?.toString() || "Email must be valid and unique"}
          </p>
        ) : (
          <p className="text-xs text-gray-400 mt-1">
            Email must be valid and unique
          </p>
        )}
        <InputField
          label="Password"
          name="password"
          defaultValue=""
          register={register}
          error={errors?.password}
          type="password"
        />
        {errors?.password ? (
          <p className="text-xs text-red-400 mt-1">
            {errors.password.message?.toString() || "Password must be at least 8 characters"}
          </p>
        ) : (
          <p className="text-xs text-gray-400 mt-1">
            Password must be at least 8 characters
          </p>
        )}
      </div>
      <span className="text-xs text-gray-400 font-medium">
        Personal Information
      </span>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="First Name"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors.name}
        />
        <InputField
          label="Last Name"
          name="surname"
          defaultValue={data?.surname}
          register={register}
          error={errors.surname}
        />
        <InputField
          label="Phone"
          name="phone"
          defaultValue={data?.phone}
          register={register}
          error={errors.phone}
        />
        <InputField
          label="Address"
          name="address"
          defaultValue={data?.address}
          register={register}
          error={errors.address}
        />
        <InputField
          label="Blood Type"
          name="bloodType"
          defaultValue={data?.bloodType}
          register={register}
          error={errors.bloodType}
        />
        <InputField
          label="Birthday"
          name="birthday"
          defaultValue={data?.birthday.toISOString().split("T")[0]}
          register={register}
          error={errors.birthday}
          type="date"
        />
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
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Sex</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("sex")}
            defaultValue={data?.sex}
          >
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
          {errors.sex?.message && (
            <p className="text-xs text-red-400">
              {errors.sex.message.toString()}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Subjects</label>
          <select
            multiple
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("subjects")}
            defaultValue={data?.subjects ? data.subjects.map((s: any) => s.id || s) : []}
          >
            {subjects.map((subject: { id: number; name: string }) => (
              <option value={subject.id} key={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
          {errors.subjects?.message && (
            <p className="text-xs text-red-400">
              {errors.subjects.message.toString()}
            </p>
          )}
        </div>
        <div className="flex flex-col w-full md:w-1/4 gap-4">
          <label className="text-xs text-gray-500">Profile Picture</label>
          
          {/* Show image preview if uploaded */}
          {img?.secure_url && (
            <div className="relative w-40 h-40 rounded-md overflow-hidden border border-gray-300">
              <Image 
                src={img.secure_url} 
                alt="Teacher profile" 
                fill 
                className="object-cover"
              />
            </div>
          )}
          
          {/* Show default profile picture if image is in data but not yet uploaded in this session */}
          {!img?.secure_url && data?.img && (
            <div className="relative w-40 h-40 rounded-md overflow-hidden border border-gray-300">
              <Image 
                src={data.img} 
                alt="Teacher profile" 
                fill 
                className="object-cover"
              />
            </div>
          )}
          
          <CldUploadWidget
            uploadPreset="sbms-upload-preset"
            onSuccess={(result, { widget }) => {
              setImg(result.info);
              widget.close();
            }}
          >
            {({ open }) => {
              return (
                <div
                  className="text-xs text-gray-500 flex items-center gap-2 cursor-pointer bg-gray-50 p-2 rounded-md hover:bg-gray-100 w-fit"
                  onClick={() => open()}
                >
                  <Image src="/upload.png" alt="Upload icon" width={24} height={24} />
                  <span>{img?.secure_url || data?.img ? 'Change photo' : 'Upload a photo'}</span>
                </div>
              );
            }}
          </CldUploadWidget>
        </div>
      </div>
      {state.error && (
        <div className="bg-red-50 p-3 rounded-md border border-red-200">
          <span className="text-red-500 font-medium">Error: </span>
          <span className="text-red-500">
            {state.message || "Something went wrong! Please check the browser console for details."}
            {!state.message && (
              <>
                <br />
                <small>Common issues: Email format, password length, or unique username constraint.</small>
              </>
            )}
          </span>
        </div>
      )}
      <button 
        type="submit" 
        disabled={state.isSubmitting}
        className="bg-blue-400 text-white p-2 rounded-md disabled:bg-blue-300 disabled:cursor-not-allowed"
      >
        {state.isSubmitting ? (
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

export default TeacherForm;
