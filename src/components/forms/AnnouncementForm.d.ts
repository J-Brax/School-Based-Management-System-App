import { Dispatch, SetStateAction } from 'react';

// This is a global declaration file for the AnnouncementForm component
// It helps TypeScript understand the structure when doing dynamic imports

declare global {
  namespace JSX {
    interface AnnouncementFormProps {
      type: "create" | "update";
      data?: any;
      setOpen: Dispatch<SetStateAction<boolean>>;
      relatedData?: any;
    }
  }
}

// This empty export makes this a module rather than a script
export {};
