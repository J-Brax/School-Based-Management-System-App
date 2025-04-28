// Type declarations for Announcement components

declare module '*/AnnouncementForm' {
  import { FC } from 'react';
  import { Dispatch, SetStateAction } from 'react';

  export interface AnnouncementFormProps {
    type: "create" | "update";
    data?: any;
    setOpen: Dispatch<SetStateAction<boolean>>;
    relatedData?: any;
  }

  const AnnouncementForm: FC<AnnouncementFormProps>;
  export default AnnouncementForm;
}
