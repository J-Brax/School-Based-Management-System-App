declare module './AnnouncementForm' {
  import { Dispatch, SetStateAction } from 'react';
  
  interface AnnouncementFormProps {
    type: "create" | "update";
    data?: any;
    setOpen: Dispatch<SetStateAction<boolean>>;
    relatedData?: any;
  }
  
  const AnnouncementForm: React.FC<AnnouncementFormProps>;
  export default AnnouncementForm;
}
