import { useState, useEffect, useMemo, useCallback } from "react";
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X, ChevronDown, ChevronUp, Filter, RefreshCw } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Search, Plus, Users, UserCheck, UserX, Shield, Lock, Unlock, Edit, Crown, Camera, Upload, Eye, EyeOff, Trash2, Save } from "lucide-react";
import { adminAPI, authAPI } from "../Axios/Axios";
import Calendar from "react-calendar";
import * as Yup from 'yup';
import { useGlobalTheme } from "../../../contexts/GlobalThemeContext";


const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border bg-card text-card-foreground shadow",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-4 sm:p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-4 sm:p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-xs sm:text-sm", className)}
      {...props}
    />
  </div>
));
Table.displayName = "Table";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    )}
    {...props}
  />
));
TableCell.displayName = "TableCell";

const Dialog = DialogPrimitive.Root;
const DialogPortal = DialogPrimitive.Portal;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-[95vw] translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

const getCalendarStyles = (isDark: boolean) => `
  .custom-calendar {
    font-family: inherit;
    border-radius: 0.75rem;
    box-shadow: ${isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.07)'};
    padding: 0.375rem;
    border: 1px solid ${isDark ? '#374151' : '#e0e7ff'};
    background: ${isDark ? '#1f2937' : 'white'};
    color: ${isDark ? '#f9fafb' : '#111827'};
    max-width: 100%;
    margin: 0 auto;
  }
  
  @media (min-width: 640px) {
    .custom-calendar {
      border-radius: 1rem;
      padding: 0.5rem;
    }
  }
  
  .custom-calendar .react-calendar__tile {
    text-align: center;
    padding: 0.375rem;
    border-radius: 0.375rem;
    transition: all 0.2s;
    font-weight: 500;
    background: ${isDark ? '#374151' : 'white'};
    color: ${isDark ? '#f9fafb' : '#111827'};
    border: none;
    font-size: 0.75rem;
  }
  
  @media (min-width: 640px) {
    .custom-calendar .react-calendar__tile {
      padding: 0.5rem;
      border-radius: 0.5rem;
      font-size: 0.875rem;
    }
  }
  
  .custom-calendar .react-calendar__tile--active {
    background: #8b5cf6 !important;
    color: #fff !important;
    font-weight: bold;
    box-shadow: 0 2px 8px #8b5cf633;
  }
  
  .custom-calendar .react-calendar__tile:hover {
    background: ${isDark ? '#4b5563' : '#e0e7ff'};
    color: #8b5cf6;
    box-shadow: 0 2px 8px #8b5cf622;
  }
  
  .custom-calendar .react-calendar__navigation button {
    min-width: 0;
    width: 28px;
    height: 28px;
    background: transparent;
    border: none;
    margin: 0 2px;
    padding: 0;
    font-size: 0.875rem;
    color: #8b5cf6;
    border-radius: 50%;
    box-shadow: none;
    transition: background 0.2s, box-shadow 0.2s;
  }
  
  @media (min-width: 640px) {
    .custom-calendar .react-calendar__navigation button {
      width: 32px;
      height: 32px;
      margin: 0 4px;
      font-size: 1rem;
    }
  }
  
  .custom-calendar .react-calendar__navigation button:disabled {
    color: ${isDark ? '#6b7280' : '#d1d5db'};
    background: transparent;
  }
  
  .custom-calendar .react-calendar__navigation button:focus {
    outline: none;
    box-shadow: 0 0 0 2px #8b5cf633;
  }
  
  .custom-calendar .react-calendar__navigation button:hover {
    background: ${isDark ? '#4b5563' : '#f3f4f6'};
  }
  
  .custom-calendar .react-calendar__month-view__weekdays {
    font-size: 0.75rem;
    font-weight: 600;
    color: ${isDark ? '#d1d5db' : '#374151'};
    letter-spacing: 0.5px;
    text-align: center;
    border-bottom: 1px dashed ${isDark ? '#4b5563' : '#d1d5db'};
    padding-bottom: 0.375rem;
    margin-bottom: 0.375rem;
  }
  
  @media (min-width: 640px) {
    .custom-calendar .react-calendar__month-view__weekdays {
      font-size: 0.875rem;
      padding-bottom: 0.5rem;
      margin-bottom: 0.5rem;
    }
  }
  
  .custom-calendar .react-calendar__tile--now {
    background: ${isDark ? '#fbbf24' : '#fef3c7'} !important;
    color: ${isDark ? '#92400e' : '#d97706'} !important;
    font-weight: bold;
  }
  
  .custom-calendar .react-calendar__tile--now:hover {
    background: #f59e0b !important;
    color: white !important;
  }
  
  .custom-calendar .react-calendar__navigation {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.75rem;
  }
  
  @media (min-width: 640px) {
    .custom-calendar .react-calendar__navigation {
      margin-bottom: 1rem;
    }
  }
  
  .custom-calendar .react-calendar__navigation__label {
    font-weight: 600;
    font-size: 0.875rem;
    color: ${isDark ? '#f9fafb' : '#374151'};
  }
  
  @media (min-width: 640px) {
    .custom-calendar .react-calendar__navigation__label {
      font-size: 1.125rem;
    }
  }
  
  .custom-calendar .react-calendar__year-view .react-calendar__tile,
  .custom-calendar .react-calendar__decade-view .react-calendar__tile,
  .custom-calendar .react-calendar__century-view .react-calendar__tile {
    padding: 0.75rem 0.375rem;
    border-radius: 0.375rem;
    transition: all 0.2s;
    font-weight: 500;
    background: ${isDark ? '#374151' : 'white'};
    color: ${isDark ? '#f9fafb' : '#111827'};
    font-size: 0.75rem;
  }
  
  @media (min-width: 640px) {
    .custom-calendar .react-calendar__year-view .react-calendar__tile,
    .custom-calendar .react-calendar__decade-view .react-calendar__tile,
    .custom-calendar .react-calendar__century-view .react-calendar__tile {
      padding: 1rem 0.5rem;
      border-radius: 0.5rem;
      font-size: 0.875rem;
    }
  }
  
  .custom-calendar .react-calendar__year-view .react-calendar__tile:hover,
  .custom-calendar .react-calendar__decade-view .react-calendar__tile:hover,
  .custom-calendar .react-calendar__century-view .react-calendar__tile:hover {
    background: ${isDark ? '#4b5563' : '#e0e7ff'};
    color: #8b5cf6;
  }
  
  .custom-calendar .react-calendar__year-view .react-calendar__tile--active,
  .custom-calendar .react-calendar__decade-view .react-calendar__tile--active,
  .custom-calendar .react-calendar__century-view .react-calendar__tile--active {
    background: #8b5cf6 !important;
    color: white !important;
    font-weight: bold;
  }
`;

const newUserPasswordValidationSchema = Yup.object({
  password: Yup.string()
    .required('Password is required')
    .test('password-strength', 'Password must be 8-50 characters with uppercase, lowercase, numbers', value => {
      if (!value) return false;
      
      if (value.length < 8 || value.length > 50) return false;
      
      const hasLowercase = /[a-z]/.test(value);
      const hasUppercase = /[A-Z]/.test(value);
      const hasNumber = /\d/.test(value);
      const hasNoSpaces = !/\s/.test(value);
      
      const commonPasswords = ['password', '123456', 'admin', 'user', 'test', 'qwerty', 'password123', 'admin123'];
      const isNotCommon = !commonPasswords.includes(value.toLowerCase());
      
      return hasLowercase && hasUppercase && hasNumber && hasNoSpaces && isNotCommon;
    })
});

interface User {
  _id: string;
  userid: string;
  username: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  identifyNumber?: string;
  age?: number;
  gender?: string;
  address?: string;
  dateOfBirth?: string | Date;
  role: string;
  isActive: boolean;
  image?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}


const Accounts = () => {
  const { isDarkMode } = useGlobalTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [roles] = useState<Role[]>([
    { id: "2", name: "user", description: "Regular User", permissions: ["read"] },
    { id: "3", name: "doctor", description: "Blood Test Doctor", permissions: ["read", "write", "medical"] },
    { id: "4", name: "nurse", description: "Medical Nurse", permissions: ["read", "write", "patient"] },
    { id: "1", name: "admin", description: "System Administrator", permissions: ["all"] },
  ]);
  
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToToggle, setUserToToggle] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<string>("username");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showPassword, setShowPassword] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [userForm, setUserForm] = useState({
    username: "",
    email: "",
    fullName: "",
    phoneNumber: "",
    identifyNumber: "",
    age: "",
    gender: "",
    address: "",
    dateOfBirth: "",
    role: "user",
    password: "",
    image: "",
    avatar: "",
  });


  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarView, setCalendarView] = useState<'month' | 'year' | 'decade' | 'century'>('month');

  const [formErrors, setFormErrors] = useState<any>({});
  
  
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (showUserModal && !editingUser) {
      setUserForm(prev => ({ ...prev, password: "" }));
    }
  }, [showUserModal, editingUser]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDatePicker) {
        const target = event.target as Element;
        if (!target.closest('.date-picker-container') && 
            !target.closest('.react-calendar') &&
            !target.closest('.custom-calendar')) {
          setShowDatePicker(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDatePicker]);

  const formatDateForInput = (date: string | Date | undefined): string => {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDateForDisplay = (date: string | Date | undefined): string => {
    if (!date) return "Select your date of birth";
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const calculateAge = (birthDate: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age > 0 ? age : 0;
  };

  const handleDateChange = (value: any) => {
    let newDate = value instanceof Date ? value : (Array.isArray(value) && value[0] instanceof Date ? value[0] : null);
    if (newDate) {
      setSelectedDate(newDate);
      const year = newDate.getFullYear();
      const month = String(newDate.getMonth() + 1).padStart(2, '0');
      const day = String(newDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      const calculatedAge = calculateAge(newDate);
      setUserForm({ ...userForm, dateOfBirth: formattedDate, age: calculatedAge.toString() });
      setShowDatePicker(false);
      setCalendarView('month');
    }
  };

  const handleViewChange = (args: { action?: string; activeStartDate: Date | null; value?: any; view: string }) => {
    setCalendarView(args.view as 'month' | 'year' | 'decade' | 'century');
  };

  const setToday = () => {
    const today = new Date();
    setSelectedDate(today);
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    const calculatedAge = calculateAge(today);
    setUserForm({ ...userForm, dateOfBirth: formattedDate, age: calculatedAge.toString() });
    setShowDatePicker(false);
  };

  const clearDate = () => {
    setSelectedDate(null);
    setUserForm({ ...userForm, dateOfBirth: "", age: "" });
    setShowDatePicker(false);
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast("Please select an image file", "error");
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        showToast("Image size should be less than 5MB", "error");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        // Update both avatarPreview and userForm to ensure consistency
        setAvatarPreview(result);
        setUserForm(prev => ({ ...prev, image: result, avatar: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setAvatarPreview("");
    setUserForm({ ...userForm, image: "", avatar: "" });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };



  const validateNewUserPassword = async () => {
    if (editingUser) return true;
    
    try {
      await newUserPasswordValidationSchema.validate({
        password: userForm.password
      }, { abortEarly: false });
      return true;
    } catch (error: any) {
      const errors: any = {};
      error.inner.forEach((err: any) => {
        errors[err.path] = err.message;
      });
      setFormErrors((prev: any) => ({ ...prev, ...errors }));
      return false;
    }
  };


  const showToast = (message: string, type: 'success' | 'error') => {
    if (type === 'success') {
      toast.success(message, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: isDarkMode ? "dark" : "light",
        style: {
          background: isDarkMode 
            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
            : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: '#ffffff',
          borderRadius: '12px',
          boxShadow: isDarkMode 
            ? '0 10px 25px rgba(16, 185, 129, 0.3), 0 0 0 1px rgba(16, 185, 129, 0.1)' 
            : '0 10px 25px rgba(16, 185, 129, 0.2), 0 0 0 1px rgba(16, 185, 129, 0.1)',
          border: 'none',
          fontSize: '14px',
          fontWeight: '500',
          padding: '16px 20px',
          minHeight: '60px',
        },
      });
    } else {
      toast.error(message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: isDarkMode ? "dark" : "light",
        style: {
          background: isDarkMode 
            ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
            : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: '#ffffff',
          borderRadius: '12px',
          boxShadow: isDarkMode 
            ? '0 10px 25px rgba(239, 68, 68, 0.3), 0 0 0 1px rgba(239, 68, 68, 0.1)' 
            : '0 10px 25px rgba(239, 68, 68, 0.2), 0 0 0 1px rgba(239, 68, 68, 0.1)',
          border: 'none',
          fontSize: '14px',
          fontWeight: '500',
          padding: '16px 20px',
          minHeight: '60px',
        },
      });
    }
  };


  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminAPI.getAllAccounts();
      const usersData = response.data || [];
      setUsers(usersData);
    } catch (error: any) {
      setError("Failed to fetch users");
      setUsers([]);
      showToast("Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  };


  const handleVerifyAccount = async (user: User) => {
    try {
      setLoading(true);
      await adminAPI.deleteAccount(user.userid, true);
      await fetchUsers();
      showToast(`Account ${user.username} has been verified successfully!`, "success");
    } catch (error: any) {
      showToast("Failed to verify account", "error");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = async () => {
    const errors: any = {};
    
    if (!userForm.username.trim()) {
      errors.username = "Username is required";
    }
    
    if (!userForm.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(userForm.email)) {
      errors.email = "Invalid email format";
    }
    
    if (!userForm.fullName.trim()) {
      errors.fullName = "Full name is required";
    }
    
    if (!editingUser && !userForm.password.trim()) {
      errors.password = "Password is required";
    }
    
    setFormErrors(errors);
    
    const isNewUserPasswordValid = await validateNewUserPassword();
    
    return Object.keys(errors).length === 0 && isNewUserPasswordValid;
  };

  const handleAddUser = () => {
    
    setSearchTerm("");
    setShowUserModal(false);
    setTimeout(() => {
      setEditingUser(null);
      setFormErrors({});
      
      const emptyForm = {
        username: "",
        email: "",
        fullName: "",
        phoneNumber: "",
        identifyNumber: "",
        age: "",
        gender: "",
        address: "",
        dateOfBirth: "",
        role: "user",
        password: "",
        image: "",
        avatar: "",
      };
      
      setUserForm(emptyForm);
      
      setSelectedDate(null);
      
      setAvatarPreview("");
      
      setUserForm(prev => ({ ...prev, password: "" }));
      
      setShowUserModal(true);
    }, 100);
  };

  const handleCloseModal = () => {
    
    setSearchTerm("");
    setShowUserModal(false);
    setTimeout(() => {
      setEditingUser(null);
      setFormErrors({});
      
      const emptyForm = {
        username: "",
        email: "",
        fullName: "",
        phoneNumber: "",
        identifyNumber: "",
        age: "",
        gender: "",
        address: "",
        dateOfBirth: "",
        role: "user",
        password: "",
        image: "",
        avatar: "",
      };
      
      setUserForm(emptyForm);
      
      setSelectedDate(null);
      
      setAvatarPreview("");
    }, 100);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    
    let calculatedAge = "";
    if (user.dateOfBirth) {
      const birthDate = new Date(user.dateOfBirth);
      if (!isNaN(birthDate.getTime())) {
        calculatedAge = calculateAge(birthDate).toString();
      }
    }
    
    setUserForm({
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber || "",
      identifyNumber: user.identifyNumber || "",
      age: calculatedAge || user.age?.toString() || "",
      gender: user.gender || "",
      address: user.address || "",
      dateOfBirth: formatDateForInput(user.dateOfBirth),
      role: user.role,
      password: "",
      image: user.image || "",
      avatar: user.avatar || "",
    });
    
    if (user.dateOfBirth) {
      const birthDate = new Date(user.dateOfBirth);
      if (!isNaN(birthDate.getTime())) {
        setSelectedDate(birthDate);
      }
    } else {
      setSelectedDate(null);
    }
    
    const userImage = user.image || user.avatar;
    if (userImage) {
      setAvatarPreview(userImage);
    } else {
      setAvatarPreview("");
    }
    
    setFormErrors({});
    setShowUserModal(true);
  };

  const handleSaveUser = async () => {
    const isValid = await validateForm();
    
    if (!isValid) {
      showToast("❌ Please fill in all required fields correctly", "error");
      return;
    }

    try {
      setLoading(true);

      if (editingUser) {
        // Determine image to save: prioritize avatarPreview (newly uploaded image)
        // If avatarPreview exists and is not empty, use it; otherwise use userForm.image
        const imageToSave = (avatarPreview && avatarPreview.trim() !== "") 
          ? avatarPreview 
          : (userForm.image && userForm.image.trim() !== "") 
            ? userForm.image 
            : undefined;
        
        const updateData = {
          username: userForm.username,
          email: userForm.email,
          fullName: userForm.fullName,
          phoneNumber: userForm.phoneNumber || undefined,
          identifyNumber: userForm.identifyNumber || undefined,
          age: userForm.age ? parseInt(userForm.age) : undefined,
          gender: userForm.gender || undefined,
          address: userForm.address || undefined,
          dateOfBirth: userForm.dateOfBirth ? new Date(userForm.dateOfBirth) : undefined,
          role: userForm.role,
          image: imageToSave,
          // Note: Backend only uses 'image' field, but we send both for compatibility
          avatar: imageToSave,
        };

        await adminAPI.updateAccount(editingUser.userid, updateData);
        
        showToast(`✅ User "${userForm.fullName}" updated successfully!`, "success");
        
        setShowUserModal(false);
        setEditingUser(null);
        setFormErrors({});
        
        await fetchUsers();
      } else {
        const newUserData = {
          username: userForm.username,
          email: userForm.email,
          password: userForm.password,
          fullName: userForm.fullName,
          phoneNumber: userForm.phoneNumber || undefined,
          identifyNumber: userForm.identifyNumber || undefined,
          age: userForm.age ? parseInt(userForm.age) : undefined,
          gender: userForm.gender || undefined,
          address: userForm.address || undefined,
          dateOfBirth: userForm.dateOfBirth || undefined,
          role: userForm.role,
          image: avatarPreview || userForm.image || undefined,
          avatar: avatarPreview || userForm.avatar || undefined,
        };

        await authAPI.register(newUserData);
        
        showToast(`🎉 New user "${userForm.fullName}" created successfully!`, "success");
        
        setShowUserModal(false);
        setEditingUser(null);
        setFormErrors({});
        
        await fetchUsers();
      }
    } catch (error: any) {
      
      let errorMessage = "Unable to save account";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showToast(`❌ ${errorMessage}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = (user: User) => {
    setUserToToggle(user);
    setShowDeleteConfirm(true);
  };

  const confirmToggleStatus = async () => {
    if (!userToToggle) return;

    const newStatus = !userToToggle.isActive;
    const action = newStatus ? "unlock" : "lock";

    try {
      setLoading(true);
      
      await adminAPI.deleteAccount(userToToggle.userid, newStatus);
      
      await fetchUsers();
      
      showToast(`🔓 Account ${action}ed successfully!`, "success");
    } catch (error: any) {
      showToast(`❌ Unable to ${action} account. Please try again.`, "error");
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
      setUserToToggle(null);
    }
  };

  const filteredUsers = useMemo(() => {
    let filtered = (users || []).filter(user => {
      const matchSearch = 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchRole = filterRole === "all" || user.role === filterRole;
      const matchStatus = filterStatus === "all" || 
        (filterStatus === "active" && user.isActive) ||
        (filterStatus === "locked" && !user.isActive);
      
      return matchSearch && matchRole && matchStatus;
    });

    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof User];
      let bValue: any = b[sortBy as keyof User];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [users, searchTerm, filterRole, filterStatus, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterRole, filterStatus]);

  const totalUsers = (users || []).length;
  const activeUsers = (users || []).filter(u => u.isActive).length;
  const lockedUsers = (users || []).filter(u => !u.isActive).length;
  const adminCount = (users || []).filter(u => u.role === "admin").length;
  const doctorCount = (users || []).filter(u => u.role === "doctor").length;
  const nurseCount = (users || []).filter(u => u.role === "nurse").length;

  const getRoleIcon = useCallback((role: string) => {
    const iconProps = { className: "w-4 h-4", fill: "currentColor", viewBox: "0 0 20 20" };
    
    switch(role) {
      case "admin":
        return (
          <svg {...iconProps}>
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
          </svg>
        );
      case "doctor":
        return (
          <svg {...iconProps}>
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
          </svg>
        );
      case "nurse":
        return (
          <svg {...iconProps}>
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
          </svg>
        );
      default:
        return (
          <svg {...iconProps}>
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
          </svg>
        );
    }
  }, []);

  const handleSort = useCallback((column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  }, [sortBy, sortOrder]);

  const clearAllFilters = useCallback(() => {
    setSearchTerm("");
    setFilterRole("all");
    setFilterStatus("all");
    setSortBy("username");
    setSortOrder("asc");
    setCurrentPage(1);
  }, []);

  return (
    <>
      <style>{getCalendarStyles(isDarkMode)}</style>
      <style>{`
        .Toastify__toast {
          font-family: inherit !important;
          border-radius: 10px !important;
          box-shadow: ${isDarkMode 
            ? '0 10px 25px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)' 
            : '0 10px 25px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)'} !important;
          backdrop-filter: blur(10px) !important;
          border: none !important;
          min-height: 50px !important;
          padding: 12px 16px !important;
          font-size: 13px !important;
          font-weight: 500 !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        
        @media (min-width: 640px) {
          .Toastify__toast {
            border-radius: 12px !important;
            min-height: 60px !important;
            padding: 16px 20px !important;
            font-size: 14px !important;
          }
        }
        
        .Toastify__toast--success {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
          color: #ffffff !important;
        }
        
        .Toastify__toast--error {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
          color: #ffffff !important;
        }
        
        .Toastify__toast:hover {
          transform: translateY(-2px) !important;
          box-shadow: ${isDarkMode 
            ? '0 15px 35px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.15)' 
            : '0 15px 35px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.1)'} !important;
        }
        
        .Toastify__progress-bar {
          background: rgba(255, 255, 255, 0.3) !important;
          height: 3px !important;
          border-radius: 0 0 12px 12px !important;
        }
        
        .Toastify__close-button {
          color: #ffffff !important;
          font-size: 18px !important;
          font-weight: bold !important;
          opacity: 0.8 !important;
          transition: opacity 0.2s ease !important;
        }
        
        .Toastify__close-button:hover {
          opacity: 1 !important;
        }
        
        .Toastify__toast-body {
          margin: 0 !important;
          padding: 0 !important;
          display: flex !important;
          align-items: center !important;
          gap: 12px !important;
        }
        
        .Toastify__toast-icon {
          font-size: 20px !important;
          margin-right: 8px !important;
        }
        
        .Toastify__toast-container {
          top: 10px !important;
          right: 10px !important;
        }
        
        @media (min-width: 640px) {
          .Toastify__toast-container {
            top: 20px !important;
            right: 20px !important;
          }
        }
        
        .Toastify__toast-container--top-right {
          top: 10px !important;
          right: 10px !important;
        }
        
        @media (min-width: 640px) {
          .Toastify__toast-container--top-right {
            top: 20px !important;
            right: 20px !important;
          }
        }
      `}</style>
      <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-background'}`}>
        <div className="container mx-auto p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Account Management
            </h1>
            <p className={`text-sm sm:text-base transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-muted-foreground'}`}>
              Manage users and permissions in the system
            </p>
          </div>
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="text-right">
              <div className={`text-xs sm:text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-muted-foreground'}`}>
                Total Users
              </div>
              <div className={`text-xl sm:text-2xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {totalUsers}
              </div>
            </div>
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center transition-colors duration-300 ${
              isDarkMode ? 'bg-purple-600' : 'bg-primary'
            }`}>
              <Users className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-primary-foreground'
              }`} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
          <Card className={`border-l-4 border-blue-500 hover:shadow-lg transition-all duration-300 ${
            isDarkMode 
              ? 'bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-gray-700 hover:shadow-xl hover:shadow-blue-500/20' 
              : 'bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200'
          }`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4 lg:p-6">
              <CardTitle className={`text-xs sm:text-sm font-medium transition-colors duration-300 ${
                isDarkMode ? 'text-gray-200' : 'text-gray-900'
              }`}>
                Total Users
              </CardTitle>
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
                isDarkMode ? 'bg-blue-900' : 'bg-blue-100'
              }`}>
                <Users className={`h-4 w-4 sm:h-5 sm:w-5 transition-colors duration-300 ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`} />
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
              <div className={`text-xl sm:text-2xl font-bold transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {totalUsers}
              </div>
              <p className="text-green-500 text-xs font-medium mt-1 sm:mt-2">↑ 5% from last week</p>
            </CardContent>
          </Card>

          <Card className={`border-l-4 border-green-500 hover:shadow-lg transition-all duration-300 ${
            isDarkMode 
              ? 'bg-gradient-to-br from-green-900/20 to-emerald-800/10 border-gray-700 hover:shadow-xl hover:shadow-green-500/20' 
              : 'bg-gradient-to-br from-green-50 to-emerald-100/50 border-green-200'
          }`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4 lg:p-6">
              <CardTitle className={`text-xs sm:text-sm font-medium transition-colors duration-300 ${
                isDarkMode ? 'text-gray-200' : 'text-gray-900'
              }`}>
                Active Users
              </CardTitle>
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
                isDarkMode ? 'bg-green-900' : 'bg-green-100'
              }`}>
                <UserCheck className={`h-4 w-4 sm:h-5 sm:w-5 transition-colors duration-300 ${
                  isDarkMode ? 'text-green-400' : 'text-green-600'
                }`} />
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
              <div className={`text-xl sm:text-2xl font-bold transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {activeUsers}
              </div>
              <p className="text-green-500 text-xs font-medium mt-1 sm:mt-2">↑ 12% from last week</p>
            </CardContent>
          </Card>

          <Card className={`border-l-4 border-violet-500 hover:shadow-lg transition-all duration-300 ${
            isDarkMode 
              ? 'bg-gradient-to-br from-violet-900/20 to-purple-800/10 border-gray-700 hover:shadow-xl hover:shadow-violet-500/20' 
              : 'bg-gradient-to-br from-violet-50 to-purple-100/50 border-violet-200'
          }`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4 lg:p-6">
              <CardTitle className={`text-xs sm:text-sm font-medium transition-colors duration-300 ${
                isDarkMode ? 'text-gray-200' : 'text-gray-900'
              }`}>
                Locked Users
              </CardTitle>
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
                isDarkMode ? 'bg-violet-900' : 'bg-violet-100'
              }`}>
                <Lock className={`h-4 w-4 sm:h-5 sm:w-5 transition-colors duration-300 ${
                  isDarkMode ? 'text-violet-400' : 'text-violet-600'
                }`} />
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
              <div className={`text-xl sm:text-2xl font-bold transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {lockedUsers}
              </div>
              <p className="text-violet-500 text-xs font-medium mt-1 sm:mt-2">→ 2% from last week</p>
            </CardContent>
          </Card>

          <Card className={`border-l-4 border-amber-500 hover:shadow-lg transition-all duration-300 ${
            isDarkMode 
              ? 'bg-gradient-to-br from-amber-900/20 to-yellow-800/10 border-gray-700 hover:shadow-xl hover:shadow-amber-500/20' 
              : 'bg-gradient-to-br from-amber-50 to-yellow-100/50 border-amber-200'
          }`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4 lg:p-6">
              <CardTitle className={`text-xs sm:text-sm font-medium transition-colors duration-300 ${
                isDarkMode ? 'text-gray-200' : 'text-gray-900'
              }`}>
                Administrators
              </CardTitle>
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
                isDarkMode ? 'bg-amber-900' : 'bg-amber-100'
              }`}>
                <Crown className={`h-4 w-4 sm:h-5 sm:w-5 transition-colors duration-300 ${
                  isDarkMode ? 'text-amber-400' : 'text-amber-600'
                }`} />
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
              <div className={`text-xl sm:text-2xl font-bold transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {adminCount}
              </div>
              <p className="text-amber-500 text-xs font-medium mt-1 sm:mt-2">→ 0% from last week</p>
            </CardContent>
          </Card>

          <Card className={`border-l-4 border-green-500 hover:shadow-lg transition-all duration-300 ${
            isDarkMode 
              ? 'bg-gradient-to-br from-green-900/20 to-emerald-800/10 border-gray-700 hover:shadow-xl hover:shadow-green-500/20' 
              : 'bg-gradient-to-br from-green-50 to-emerald-100/50 border-green-200'
          }`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4 lg:p-6">
              <CardTitle className={`text-xs sm:text-sm font-medium transition-colors duration-300 ${
                isDarkMode ? 'text-gray-200' : 'text-gray-900'
              }`}>
                Doctors
              </CardTitle>
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
                isDarkMode ? 'bg-green-900' : 'bg-green-100'
              }`}>
                <Shield className={`h-4 w-4 sm:h-5 sm:w-5 transition-colors duration-300 ${
                  isDarkMode ? 'text-green-400' : 'text-green-600'
                }`} />
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
              <div className={`text-xl sm:text-2xl font-bold transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {doctorCount}
              </div>
              <p className="text-green-500 text-xs font-medium mt-1 sm:mt-2">↑ 8% from last week</p>
            </CardContent>
          </Card>

          <Card className={`border-l-4 border-blue-500 hover:shadow-lg transition-all duration-300 ${
            isDarkMode 
              ? 'bg-gradient-to-br from-blue-900/20 to-cyan-800/10 border-gray-700 hover:shadow-xl hover:shadow-blue-500/20' 
              : 'bg-gradient-to-br from-blue-50 to-cyan-100/50 border-blue-200'
          }`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4 lg:p-6">
              <CardTitle className={`text-xs sm:text-sm font-medium transition-colors duration-300 ${
                isDarkMode ? 'text-gray-200' : 'text-gray-900'
              }`}>
                Nurses
              </CardTitle>
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
                isDarkMode ? 'bg-blue-900' : 'bg-blue-100'
              }`}>
                <Users className={`h-4 w-4 sm:h-5 sm:w-5 transition-colors duration-300 ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`} />
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
              <div className={`text-xl sm:text-2xl font-bold transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {nurseCount}
              </div>
              <p className="text-blue-500 text-xs font-medium mt-1 sm:mt-2">↑ 12% from last week</p>
            </CardContent>
          </Card>
        </div>

        <Card className={`transition-all duration-300 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className={`text-lg sm:text-xl transition-colors duration-300 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Search & Filter
                </CardTitle>
                <CardDescription className={`text-xs sm:text-sm transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Find users by name, email, username, or filter by role and status
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`text-xs sm:text-sm transition-all duration-300 ${
                    isDarkMode
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Filter className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
                  <span className="sm:hidden">Filters</span>
                  {showFilters ? <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" /> : <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchUsers}
                  disabled={loading}
                  className={`text-xs sm:text-sm transition-all duration-300 ${
                    isDarkMode
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 ${loading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-400' : 'text-muted-foreground'
                    }`} />
                    <Input
                      type="text"
                      placeholder="Search by name, email, username..."
                      value={searchTerm}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                      className={`pl-10 transition-all duration-300 ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500/20' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20'
                      }`}
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={handleAddUser} 
                  className="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white px-4 sm:px-6 text-xs sm:text-sm shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300"
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Add User</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </div>

              {showFilters && (
                <div className={`p-3 sm:p-4 rounded-lg border transition-all duration-300 ${
                  isDarkMode
                    ? 'bg-gray-700/50 border-gray-600'
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <label className={`text-sm font-medium transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-900'
                      }`}>
                        Role
                      </label>
                      <select
                        value={filterRole}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterRole(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 transition-all duration-300 ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white focus:ring-purple-500/20 focus:border-purple-500' 
                            : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500/20 focus:border-blue-500'
                        }`}
                      >
                        <option value="all">All roles</option>
                        <option value="admin">Admin</option>
                        <option value="doctor">Doctor</option>
                        <option value="nurse">Nurse</option>
                        <option value="user">User</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className={`text-sm font-medium transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-900'
                      }`}>
                        Status
                      </label>
                      <select
                        value={filterStatus}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterStatus(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 transition-all duration-300 ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white focus:ring-purple-500/20 focus:border-purple-500' 
                            : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500/20 focus:border-blue-500'
                        }`}
                      >
                        <option value="all">All status</option>
                        <option value="active">Active</option>
                        <option value="locked">Locked</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className={`text-sm font-medium transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-900'
                      }`}>
                        Sort By
                      </label>
                      <select
                        value={sortBy}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 transition-all duration-300 ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white focus:ring-purple-500/20 focus:border-purple-500' 
                            : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500/20 focus:border-blue-500'
                        }`}
                      >
                        <option value="username">Username</option>
                        <option value="fullName">Full Name</option>
                        <option value="email">Email</option>
                        <option value="role">Role</option>
                        <option value="isActive">Status</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className={`text-sm font-medium transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-900'
                      }`}>
                        Order
                      </label>
                      <select
                        value={sortOrder}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortOrder(e.target.value as "asc" | "desc")}
                        className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 transition-all duration-300 ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white focus:ring-purple-500/20 focus:border-purple-500' 
                            : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500/20 focus:border-blue-500'
                        }`}
                      >
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearAllFilters}
                      className={`transition-all duration-300 ${
                        isDarkMode
                          ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20 border-red-700'
                          : 'text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300'
                      }`}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear All Filters
                    </Button>
                  </div>
                </div>
              )}

            {(filterRole !== "all" || filterStatus !== "all" || searchTerm) && (
              <div className="mt-4 flex items-center gap-2 text-sm flex-wrap">
                <span className={`font-medium transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400' : 'text-muted-foreground'
                }`}>
                  Active filters:
                </span>
                {searchTerm && (
                  <Badge variant="secondary" className={`transition-colors duration-300 ${
                    isDarkMode ? 'bg-gray-700 text-gray-200 border-gray-600' : 'bg-gray-100 text-gray-700 border-gray-200'
                  }`}>
                    Search: "{searchTerm}"
                  </Badge>
                )}
                {filterRole !== "all" && (
                  <Badge variant="secondary" className={`transition-colors duration-300 ${
                    isDarkMode ? 'bg-gray-700 text-gray-200 border-gray-600' : 'bg-gray-100 text-gray-700 border-gray-200'
                  }`}>
                    Role: {filterRole}
                  </Badge>
                )}
                {filterStatus !== "all" && (
                  <Badge variant="secondary" className={`transition-colors duration-300 ${
                    isDarkMode ? 'bg-gray-700 text-gray-200 border-gray-600' : 'bg-gray-100 text-gray-700 border-gray-200'
                  }`}>
                    Status: {filterStatus}
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setFilterRole("all");
                    setFilterStatus("all");
                  }}
                  className={`transition-colors duration-300 ${
                    isDarkMode 
                      ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20' 
                      : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                  }`}
                >
                  Clear filters
                </Button>
              </div>
            )}
            </div>
          </CardContent>
        </Card>

        <Card className={`transition-all duration-300 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <CardHeader>
            <CardTitle className={`transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              User Accounts
            </CardTitle>
            <CardDescription className={`transition-colors duration-300 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Manage and monitor user accounts in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`rounded-lg border transition-all duration-300 ${
              isDarkMode 
                ? 'border-gray-600 shadow-lg shadow-gray-900/20' 
                : 'border-gray-200 shadow-sm'
            }`}>
              {/* Desktop Table View */}
              <div className="hidden lg:block">
              <Table>
                <TableHeader>
                  <TableRow className={`transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-gray-800 hover:bg-gray-700 border-b border-gray-600' 
                      : 'bg-gray-50 hover:bg-gray-100 border-b border-gray-200'
                  }`}>
                <TableHead 
                  className={`transition-colors duration-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-900'
                  }`}
                  onClick={() => handleSort('username')}
                >
                  <div className="flex items-center gap-2">
                    Username
                    {sortBy === 'username' && (
                      sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className={`transition-colors duration-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-900'
                  }`}
                  onClick={() => handleSort('fullName')}
                >
                  <div className="flex items-center gap-2">
                    Full Name
                    {sortBy === 'fullName' && (
                      sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className={`transition-colors duration-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-900'
                  }`}
                  onClick={() => handleSort('email')}
                >
                  <div className="flex items-center gap-2">
                    Email
                    {sortBy === 'email' && (
                      sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead className={`transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-900'
                }`}>
                  Phone
                </TableHead>
                <TableHead 
                  className={`transition-colors duration-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-900'
                  }`}
                  onClick={() => handleSort('role')}
                >
                  <div className="flex items-center gap-2">
                    Role
                    {sortBy === 'role' && (
                      sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className={`transition-colors duration-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-900'
                  }`}
                  onClick={() => handleSort('isActive')}
                >
                  <div className="flex items-center gap-2">
                    Status
                    {sortBy === 'isActive' && (
                      sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead className={`text-right transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-900'
                }`}>
                  Actions
                </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow className={`transition-all duration-300 ${
                      isDarkMode 
                        ? 'bg-gray-800 hover:bg-gray-700 border-b border-gray-700/50' 
                        : 'bg-white hover:bg-gray-50 border-b border-gray-100'
                    }`}>
                      <TableCell colSpan={7} className="text-center py-16">
                        <div className="flex flex-col items-center justify-center">
                          <div className={`animate-spin rounded-full h-8 w-8 border-b-2 mb-4 transition-colors duration-300 ${
                            isDarkMode ? 'border-purple-500' : 'border-primary'
                          }`}></div>
                          <span className={`transition-colors duration-300 ${
                            isDarkMode ? 'text-gray-400' : 'text-muted-foreground'
                          }`}>
                            Loading users...
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow className={`transition-all duration-300 ${
                      isDarkMode 
                        ? 'bg-gray-800 hover:bg-gray-700 border-b border-gray-700/50' 
                        : 'bg-white hover:bg-gray-50 border-b border-gray-100'
                    }`}>
                      <TableCell colSpan={7} className="text-center py-16">
                        <div className="flex flex-col items-center justify-center">
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors duration-300 ${
                            isDarkMode ? 'bg-red-900/20' : 'bg-destructive/10'
                          }`}>
                            <Users className={`w-8 h-8 transition-colors duration-300 ${
                              isDarkMode ? 'text-red-400' : 'text-destructive'
                            }`} />
                          </div>
                          <h3 className={`text-lg font-semibold mb-2 transition-colors duration-300 ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            Error Loading Users
                          </h3>
                          <p className={`mb-4 transition-colors duration-300 ${
                            isDarkMode ? 'text-gray-400' : 'text-muted-foreground'
                          }`}>
                            {error}
                          </p>
                          <Button 
                            onClick={fetchUsers} 
                            variant="destructive"
                            className={`transition-all duration-300 ${
                              isDarkMode 
                                ? 'bg-red-600 hover:bg-red-700 text-white' 
                                : 'bg-red-600 hover:bg-red-700 text-white'
                            }`}
                          >
                            Try Again
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : currentUsers.length === 0 ? (
                    <TableRow className={`transition-all duration-300 ${
                      isDarkMode 
                        ? 'bg-gray-800 hover:bg-gray-700 border-b border-gray-700/50' 
                        : 'bg-white hover:bg-gray-50 border-b border-gray-100'
                    }`}>
                      <TableCell colSpan={7} className="text-center py-16">
                        <div className="flex flex-col items-center justify-center">
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors duration-300 ${
                            isDarkMode ? 'bg-gray-700' : 'bg-muted'
                          }`}>
                            <Users className={`w-8 h-8 transition-colors duration-300 ${
                              isDarkMode ? 'text-gray-500' : 'text-muted-foreground'
                            }`} />
                          </div>
                          <h3 className={`text-lg font-semibold mb-2 transition-colors duration-300 ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            No Users Found
                          </h3>
                          <p className={`transition-colors duration-300 ${
                            isDarkMode ? 'text-gray-400' : 'text-muted-foreground'
                          }`}>
                            No users match your current search criteria.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentUsers.map((user) => (
                      <TableRow key={user._id} className={`transition-all duration-300 ${
                        isDarkMode 
                          ? 'bg-gray-800 hover:bg-gray-700 border-b border-gray-700/50 hover:border-gray-600' 
                          : 'bg-white hover:bg-gray-50 border-b border-gray-100 hover:border-gray-200'
                      }`}>
                        <TableCell>
                          <div className={`font-medium transition-colors duration-300 ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {user.username}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className={`font-medium transition-colors duration-300 ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {user.fullName}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className={`text-sm transition-colors duration-300 ${
                            isDarkMode ? 'text-gray-400' : 'text-muted-foreground'
                          }`}>
                            {user.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className={`text-sm transition-colors duration-300 ${
                            isDarkMode ? 'text-gray-400' : 'text-muted-foreground'
                          }`}>
                            {user.phoneNumber || "—"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="secondary"
                            className={`flex items-center gap-1 transition-all duration-300 ${
                              user.role === "admin" 
                                ? isDarkMode 
                                  ? "bg-gradient-to-r from-amber-900 to-yellow-800 text-amber-200 border-amber-600 shadow-lg shadow-amber-500/20" 
                                  : "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border-amber-300 shadow-md shadow-amber-200/50"
                                : user.role === "doctor" 
                                ? isDarkMode
                                  ? "bg-gradient-to-r from-green-900 to-emerald-800 text-green-200 border-green-600 shadow-lg shadow-green-500/20"
                                  : "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300 shadow-md shadow-green-200/50" 
                                : user.role === "nurse"
                                ? isDarkMode
                                  ? "bg-gradient-to-r from-blue-900 to-cyan-800 text-blue-200 border-blue-600 shadow-lg shadow-blue-500/20"
                                  : "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-300 shadow-md shadow-blue-200/50"
                                : isDarkMode
                                ? "bg-gradient-to-r from-gray-700 to-gray-600 text-gray-200 border-gray-500 shadow-lg shadow-gray-500/20"
                                : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300 shadow-md shadow-gray-200/50"
                            }`}
                          >
                            {getRoleIcon(user.role)}
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="secondary"
                            className={`flex items-center gap-1 transition-all duration-300 ${
                              user.isActive 
                                ? isDarkMode
                                  ? "bg-gradient-to-r from-green-900 to-emerald-800 text-green-200 border-green-600 shadow-lg shadow-green-500/20"
                                  : "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300 shadow-md shadow-green-200/50" 
                                : isDarkMode
                                ? "bg-gradient-to-r from-red-900 to-rose-800 text-red-200 border-red-600 shadow-lg shadow-red-500/20"
                                : "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-300 shadow-md shadow-red-200/50"
                            }`}
                          >
                            {user.isActive ? (
                              <>
                                <UserCheck className="w-3 h-3 mr-1" />
                                Active
                              </>
                            ) : (
                              <>
                                <UserX className="w-3 h-3 mr-1" />
                                Locked
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditUser(user)}
                              className={`transition-all duration-300 ${
                                isDarkMode 
                                  ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 hover:shadow-lg hover:shadow-blue-500/20' 
                                  : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 hover:shadow-md hover:shadow-blue-200/50'
                              }`}
                              title="Edit User"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {!user.isActive && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleVerifyAccount(user)}
                                className={`transition-all duration-300 ${
                                  isDarkMode 
                                    ? 'text-green-400 hover:text-green-300 hover:bg-green-900/30 hover:shadow-lg hover:shadow-green-500/20' 
                                    : 'text-green-600 hover:text-green-700 hover:bg-green-50 hover:shadow-md hover:shadow-green-200/50'
                                }`}
                                title="Verify Account"
                              >
                                <UserCheck className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggleUserStatus(user)}
                              className={`transition-all duration-300 ${
                                user.isActive 
                                  ? isDarkMode
                                    ? "text-violet-400 hover:text-violet-300 hover:bg-violet-900/30 hover:shadow-lg hover:shadow-violet-500/20"
                                    : "text-violet-600 hover:text-violet-700 hover:bg-violet-50 hover:shadow-md hover:shadow-violet-200/50"
                                  : isDarkMode
                                  ? "text-green-400 hover:text-green-300 hover:bg-green-900/30 hover:shadow-lg hover:shadow-green-500/20"
                                  : "text-green-600 hover:text-green-700 hover:bg-green-50 hover:shadow-md hover:shadow-green-200/50"
                              }`}
                              title={user.isActive ? "Lock Account" : "Unlock Account"}
                            >
                              {user.isActive ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              </div>
              
              {/* Mobile Card View */}
              <div className="lg:hidden">
                {loading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="flex flex-col items-center">
                      <div className={`animate-spin rounded-full h-8 w-8 border-b-2 mb-4 transition-colors duration-300 ${
                        isDarkMode ? 'border-purple-500' : 'border-primary'
                      }`}></div>
                      <span className={`transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-400' : 'text-muted-foreground'
                      }`}>
                        Loading users...
                      </span>
                    </div>
                  </div>
                ) : currentUsers.length === 0 ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="flex flex-col items-center">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors duration-300 ${
                        isDarkMode ? 'bg-gray-700' : 'bg-muted'
                      }`}>
                        <Users className={`w-8 h-8 transition-colors duration-300 ${
                          isDarkMode ? 'text-gray-500' : 'text-muted-foreground'
                        }`} />
                      </div>
                      <h3 className={`text-lg font-semibold mb-2 transition-colors duration-300 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        No Users Found
                      </h3>
                      <p className={`transition-colors duration-300 text-center text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-muted-foreground'
                      }`}>
                        No users match your current search criteria.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 p-3 sm:p-4">
                    {currentUsers.map((user) => (
                      <div 
                        key={user._id} 
                        className={`rounded-lg border p-3 sm:p-4 transition-all duration-300 ${
                          isDarkMode 
                            ? 'bg-gray-800 border-gray-700 hover:bg-gray-700/80' 
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${
                            user.role === "admin" 
                              ? 'from-amber-500 to-orange-500'
                              : user.role === "doctor"
                              ? 'from-green-500 to-emerald-500'
                              : user.role === "nurse"
                              ? 'from-blue-500 to-cyan-500'
                              : 'from-gray-500 to-gray-600'
                          }`}>
                            {getInitials(user.fullName)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className={`font-bold text-sm mb-1 truncate ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {user.fullName}
                            </div>
                            <div className={`text-xs mb-1 truncate ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              @{user.username}
                            </div>
                            <div className={`text-xs mb-2 truncate ${
                              isDarkMode ? 'text-gray-500' : 'text-gray-500'
                            }`}>
                              {user.email}
                            </div>
                            
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                              <Badge 
                                variant="secondary"
                                className={`flex items-center gap-1 text-xs ${
                                  user.role === "admin" 
                                    ? isDarkMode 
                                      ? "bg-gradient-to-r from-amber-900 to-yellow-800 text-amber-200 border-amber-600" 
                                      : "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border-amber-300"
                                    : user.role === "doctor" 
                                    ? isDarkMode
                                      ? "bg-gradient-to-r from-green-900 to-emerald-800 text-green-200 border-green-600"
                                      : "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300" 
                                    : user.role === "nurse"
                                    ? isDarkMode
                                      ? "bg-gradient-to-r from-blue-900 to-cyan-800 text-blue-200 border-blue-600"
                                      : "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-300"
                                    : isDarkMode
                                    ? "bg-gradient-to-r from-gray-700 to-gray-600 text-gray-200 border-gray-500"
                                    : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300"
                                }`}
                              >
                                {getRoleIcon(user.role)}
                                {user.role}
                              </Badge>
                              
                              <Badge 
                                variant="secondary"
                                className={`flex items-center gap-1 text-xs ${
                                  user.isActive 
                                    ? isDarkMode
                                      ? "bg-gradient-to-r from-green-900 to-emerald-800 text-green-200 border-green-600"
                                      : "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300" 
                                    : isDarkMode
                                    ? "bg-gradient-to-r from-red-900 to-rose-800 text-red-200 border-red-600"
                                    : "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-300"
                                }`}
                              >
                                {user.isActive ? (
                                  <>
                                    <UserCheck className="w-3 h-3" />
                                    Active
                                  </>
                                ) : (
                                  <>
                                    <UserX className="w-3 h-3" />
                                    Locked
                                  </>
                                )}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center justify-end gap-2 mt-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditUser(user)}
                                className={`h-8 px-2 transition-all duration-300 ${
                                  isDarkMode 
                                    ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-900/30' 
                                    : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                                }`}
                              >
                                <Edit className="h-3.5 w-3.5 mr-1" />
                                Edit
                              </Button>
                              {!user.isActive && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleVerifyAccount(user)}
                                  className={`h-8 px-2 transition-all duration-300 ${
                                    isDarkMode 
                                      ? 'text-green-400 hover:text-green-300 hover:bg-green-900/30' 
                                      : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                                  }`}
                                >
                                  <UserCheck className="h-3.5 w-3.5 mr-1" />
                                  Verify
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleUserStatus(user)}
                                className={`h-8 px-2 transition-all duration-300 ${
                                  user.isActive 
                                    ? isDarkMode
                                      ? "text-violet-400 hover:text-violet-300 hover:bg-violet-900/30"
                                      : "text-violet-600 hover:text-violet-700 hover:bg-violet-50"
                                    : isDarkMode
                                    ? "text-green-400 hover:text-green-300 hover:bg-green-900/30"
                                    : "text-green-600 hover:text-green-700 hover:bg-green-50"
                                }`}
                              >
                                {user.isActive ? <Lock className="h-3.5 w-3.5 mr-1" /> : <Unlock className="h-3.5 w-3.5 mr-1" />}
                                {user.isActive ? 'Lock' : 'Unlock'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {filteredUsers.length > itemsPerPage && (
              <div className={`flex flex-col sm:flex-row items-center justify-between px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-t transition-all duration-300 gap-3 sm:gap-0 ${
                isDarkMode 
                  ? 'border-gray-600 bg-gray-800/50' 
                  : 'border-gray-200 bg-gray-50/50'
              }`}>
                <div className={`text-xs sm:text-sm transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} users
                </div>
                
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`text-xs sm:text-sm px-2 sm:px-3 transition-all duration-300 ${
                      isDarkMode
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 hover:shadow-lg hover:shadow-gray-500/20 disabled:opacity-50'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md hover:shadow-gray-200/50 disabled:opacity-50'
                    }`}
                  >
                    <span className="hidden sm:inline">Previous</span>
                    <span className="sm:hidden">Prev</span>
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let page;
                      if (totalPages <= 5) {
                        page = i + 1;
                      } else if (currentPage <= 3) {
                        page = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        page = totalPages - 4 + i;
                      } else {
                        page = currentPage - 2 + i;
                      }
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className={`w-7 h-7 sm:w-8 sm:h-8 p-0 text-xs sm:text-sm transition-all duration-300 ${
                            currentPage === page
                              ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:from-blue-700 hover:to-violet-700 border-blue-600 shadow-lg shadow-blue-500/20'
                              : isDarkMode
                              ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 hover:shadow-lg hover:shadow-gray-500/20'
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md hover:shadow-gray-200/50'
                          }`}
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`text-xs sm:text-sm px-2 sm:px-3 transition-all duration-300 ${
                      isDarkMode
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 hover:shadow-lg hover:shadow-gray-500/20 disabled:opacity-50'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md hover:shadow-gray-200/50 disabled:opacity-50'
                    }`}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
      </div>

        <Dialog open={showUserModal} onOpenChange={(open) => {
          if (!open) {
            handleCloseModal();
          }
        }}>
          <DialogContent className={`w-[calc(100%-2rem)] sm:w-full max-w-5xl max-h-[90vh] overflow-y-auto transition-all duration-300 p-4 sm:p-6 ${
            isDarkMode 
              ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-gray-700 shadow-2xl shadow-gray-900/50' 
              : 'bg-gradient-to-br from-white via-gray-50 to-white border-gray-200 shadow-2xl shadow-gray-200/50'
          }`}>
          <DialogHeader className="pb-3 sm:pb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 ${
                editingUser 
                  ? 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/30' 
                  : 'bg-gradient-to-br from-blue-500 to-violet-600 shadow-blue-500/30'
              }`}>
                {editingUser ? (
                  <Edit className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                ) : (
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                )}
              </div>
              <div className="flex-1">
                <DialogTitle className={`text-lg sm:text-xl lg:text-2xl font-bold transition-colors duration-300 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {editingUser ? "Edit User Profile" : "Create New User Account"}
                </DialogTitle>
                <DialogDescription className={`text-xs sm:text-sm lg:text-base mt-1 transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {editingUser ? "Update user information, permissions and account settings" : "Set up a new user account with personal information and role assignment"}
                </DialogDescription>
              </div>
              <div className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${
                editingUser 
                  ? isDarkMode 
                    ? 'bg-amber-900/20 text-amber-300 border border-amber-700' 
                    : 'bg-amber-100 text-amber-700 border border-amber-200'
                  : isDarkMode 
                  ? 'bg-blue-900/20 text-blue-300 border border-blue-700' 
                  : 'bg-blue-100 text-blue-700 border border-blue-200'
              }`}>
                {editingUser ? "Edit Mode" : "Create Mode"}
              </div>
            </div>
          </DialogHeader>
          
            <div className="space-y-3 sm:space-y-4">
              <div className="space-y-3 sm:space-y-4">
                <div className={`p-3 sm:p-4 rounded-xl border transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-gradient-to-br from-gray-800/50 to-gray-700/30 border-gray-600 shadow-lg shadow-gray-900/20' 
                    : 'bg-gradient-to-br from-gray-50/50 to-white border-gray-200 shadow-lg shadow-gray-200/20'
                }`}>
              <div className={`flex items-center gap-2 sm:gap-3 pb-3 sm:pb-4 border-b transition-colors duration-300 ${
                isDarkMode ? 'border-gray-600' : 'border-gray-200'
              }`}>
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg shadow-purple-500/30' 
                    : 'bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-400/30'
                }`}>
                  <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h3 className={`text-base sm:text-lg lg:text-xl font-bold transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Profile Picture
                  </h3>
                  <p className={`text-xs sm:text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Upload a professional photo for the user profile
                  </p>
                </div>
              </div>
              <div className="space-y-4 sm:space-y-6">
                <div className="flex justify-center">
                  {avatarPreview || userForm.image || userForm.avatar ? (
                    <div className="relative group">
                      <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border-2 shadow-lg transition-all duration-300 ${
                        isDarkMode ? 'border-purple-500 shadow-purple-500/30' : 'border-purple-300 shadow-purple-300/30'
                      }`}>
                        <img
                          src={avatarPreview || userForm.image || userForm.avatar}
                          alt="Avatar preview"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={removeAvatar}
                        className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-full flex items-center justify-center hover:from-red-600 hover:to-rose-600 transition-all duration-300 shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40"
                      >
                        <X className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl sm:text-2xl border-2 shadow-lg transition-all duration-300 ${
                      isDarkMode ? 'border-purple-500 shadow-purple-500/30' : 'border-purple-300 shadow-purple-300/30'
                    }`}>
                      {userForm.fullName ? getInitials(userForm.fullName) : "?"}
                    </div>
                  )}
                </div>
                
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex flex-col gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <label className="flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 cursor-pointer transition-all duration-300 shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 font-medium text-sm sm:text-base">
                      <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      {avatarPreview || userForm.image || userForm.avatar ? "Change Photo" : "Upload Photo"}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                    {(avatarPreview || userForm.image || userForm.avatar) && (
                      <button
                        type="button"
                        onClick={removeAvatar}
                        className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all duration-300 font-medium text-sm ${
                          isDarkMode 
                            ? 'bg-gradient-to-r from-red-900/20 to-rose-900/20 text-red-400 hover:from-red-900/30 hover:to-rose-900/30 shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30 border border-red-700' 
                            : 'bg-gradient-to-r from-red-100 to-rose-100 text-red-600 hover:from-red-200 hover:to-rose-200 shadow-md shadow-red-200/50 hover:shadow-lg hover:shadow-red-200/70 border border-red-300'
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        Remove
                      </button>
                    )}
                  </div>
                  <div className={`p-3 sm:p-4 rounded-lg transition-all duration-300 mt-3 sm:mt-4 ${
                    isDarkMode 
                      ? 'bg-gray-800/50 border border-gray-600' 
                      : 'bg-gray-50 border border-gray-200'
                  }`}>
                    <p className={`text-xs sm:text-sm font-medium transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      📸 Upload Guidelines
                    </p>
                    <ul className={`text-xs mt-2 space-y-1 transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      <li>• Recommended: Square image, at least 200x200px</li>
                      <li>• Maximum file size: 5MB</li>
                      <li>• Supported formats: JPG, PNG, GIF</li>
                      <li className="hidden sm:list-item">• Professional photos work best</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className={`p-3 sm:p-4 rounded-xl border transition-all duration-300 ${
              isDarkMode 
                ? 'bg-gradient-to-br from-gray-800/50 to-gray-700/30 border-gray-600 shadow-lg shadow-gray-900/20' 
                : 'bg-gradient-to-br from-gray-50/50 to-white border-gray-200 shadow-lg shadow-gray-200/20'
            }`}>
              <div className={`flex items-center gap-2 sm:gap-3 pb-3 sm:pb-4 border-b transition-colors duration-300 ${
                isDarkMode ? 'border-gray-600' : 'border-gray-200'
              }`}>
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-gradient-to-br from-blue-600 to-cyan-600 shadow-lg shadow-blue-500/30' 
                    : 'bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-400/30'
                }`}>
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h3 className={`text-base sm:text-lg lg:text-xl font-bold transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Personal Information
                  </h3>
                  <p className={`text-xs sm:text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Basic user details and contact information
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-6">
                <div className="space-y-2 sm:space-y-3">
                  <label className={`text-xs sm:text-sm font-semibold flex items-center gap-1.5 sm:gap-2 transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-900'
                  }`}>
                    <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 shadow-sm`}></div>
                    Username <span className="text-red-500 font-bold">*</span>
                  </label>
                  <Input
                    type="text"
                    value={userForm.username}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserForm({ ...userForm, username: e.target.value })}
                    placeholder="Enter unique username"
                    className={`h-10 sm:h-11 lg:h-12 px-3 sm:px-4 text-sm sm:text-base rounded-xl transition-all duration-300 ${
                      formErrors.username 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                        : isDarkMode
                        ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20 shadow-lg shadow-gray-900/20'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20 shadow-md shadow-gray-200/20'
                    }`}
                  />
                  {formErrors.username && (
                    <p className="text-xs sm:text-sm text-red-500 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {formErrors.username}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className={`text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2 transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-900'
                  }`}>
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    value={userForm.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserForm({ ...userForm, email: e.target.value })}
                    placeholder="user@lab.com"
                    className={`h-10 sm:h-11 text-sm sm:text-base transition-all duration-300 ${
                      formErrors.email 
                        ? 'border-red-500 focus:border-red-500' 
                        : isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20'
                    }`}
                  />
                  {formErrors.email && (
                    <p className="text-xs sm:text-sm text-red-500 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {formErrors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className={`text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2 transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-900'
                  }`}>
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={userForm.fullName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserForm({ ...userForm, fullName: e.target.value })}
                    placeholder="John Doe"
                    className={`h-10 sm:h-11 text-sm sm:text-base transition-all duration-300 ${
                      formErrors.fullName 
                        ? 'border-red-500 focus:border-red-500' 
                        : isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-green-500 focus:ring-green-500/20'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-green-500/20'
                    }`}
                  />
                  {formErrors.fullName && (
                    <p className="text-xs sm:text-sm text-red-500 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {formErrors.fullName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className={`text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2 transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-900'
                  }`}>
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Phone Number
                  </label>
                  <Input
                    type="text"
                    value={userForm.phoneNumber}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserForm({ ...userForm, phoneNumber: e.target.value })}
                    placeholder="0987654321"
                    className={`h-10 sm:h-11 text-sm sm:text-base transition-all duration-300 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-green-500 focus:ring-green-500/20'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-green-500/20'
                    }`}
                  />
                </div>

                <div className="space-y-2">
                  <label className={`text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2 transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-900'
                  }`}>
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    Identify Number
                  </label>
                  <Input
                    type="text"
                    value={userForm.identifyNumber}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserForm({ ...userForm, identifyNumber: e.target.value })}
                    placeholder="123456789"
                    className={`h-10 sm:h-11 text-sm sm:text-base transition-all duration-300 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500/20'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500/20'
                    }`}
                  />
                </div>

                <div className="space-y-2">
                  <label className={`text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2 transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-900'
                  }`}>
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    Age
                  </label>
                  <Input
                    type="number"
                    value={userForm.age}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserForm({ ...userForm, age: e.target.value })}
                    placeholder="25"
                    min="1"
                    max="120"
                    className={`h-10 sm:h-11 text-sm sm:text-base transition-all duration-300 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500 focus:ring-orange-500/20'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-orange-500 focus:ring-orange-500/20'
                    }`}
                  />
                </div>

                <div className="space-y-2">
                  <label className={`text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2 transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-900'
                  }`}>
                    <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                    Gender
                  </label>
                  <select
                    value={userForm.gender}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setUserForm({ ...userForm, gender: e.target.value })}
                    className={`w-full h-10 sm:h-11 px-3 py-2 border rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 transition-all duration-300 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white focus:ring-pink-500/20 focus:border-pink-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:ring-pink-500/20 focus:border-pink-500'
                    }`}
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className={`text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2 transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-900'
                  }`}>
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    Date of Birth
                  </label>
                  <div className="relative date-picker-container">
                    <button
                      type="button"
                      onClick={() => setShowDatePicker(!showDatePicker)}
                      className={`w-full h-10 sm:h-11 px-3 py-2 text-left border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-purple-300 transition-all duration-200 flex items-center justify-between text-xs sm:text-sm ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white hover:border-purple-400'
                          : 'bg-white border-gray-300 text-gray-900 hover:border-purple-300'
                      }`}
                    >
                      <span className={`truncate transition-colors duration-300 ${
                        userForm.dateOfBirth 
                          ? isDarkMode ? 'text-white' : 'text-gray-900'
                          : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {userForm.dateOfBirth ? formatDateForDisplay(userForm.dateOfBirth) : "Select your date of birth"}
                      </span>
                      <svg className={`w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 transition-colors duration-300 ${
                        isDarkMode ? 'text-purple-400' : 'text-purple-500'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </button>
                    
                    {showDatePicker && (
                      <div 
                        className={`absolute top-full left-0 mt-1 w-full min-w-[280px] border rounded-lg shadow-xl z-50 p-3 sm:p-4 transition-all duration-300 ${
                          isDarkMode
                            ? 'bg-gray-800 border-gray-700'
                            : 'bg-white border-gray-200'
                        }`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Calendar
                          value={selectedDate}
                          onChange={handleDateChange}
                          className="custom-calendar"
                          calendarType="gregory"
                          view={calendarView}
                          onViewChange={handleViewChange}
                          prevLabel={<span className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-purple-600 border border-purple-100 hover:bg-purple-50 transition text-base">‹</span>}
                          nextLabel={<span className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-purple-600 border border-purple-100 hover:bg-purple-50 transition text-base">›</span>}
                          prev2Label={<span className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-purple-600 border border-purple-100 hover:bg-purple-50 transition text-base">«</span>}
                          next2Label={<span className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-purple-600 border border-purple-100 hover:bg-purple-50 transition text-base">»</span>}
                          navigationLabel={({ label }: { label: string }) => (
                            <span className="font-semibold text-base text-purple-600 cursor-pointer hover:text-purple-700 transition-colors">{label}</span>
                          )}
                          tileClassName={({ date, view }: { date: Date; view: string }) => {
                            let classes = "text-sm px-2 py-1 rounded transition-all duration-150 bg-white font-medium";
                            if (view === "month") {
                              if (selectedDate && date.toDateString() === selectedDate.toDateString()) {
                                classes += " bg-purple-600 text-white shadow";
                              }
                              if (date.getDay() === 0 || date.getDay() === 6) {
                                classes += " text-red-500";
                              }
                            }
                            return classes;
                          }}
                          formatShortWeekday={(locale: string | undefined, date: Date) => 
                            date.toLocaleDateString(locale, { weekday: 'short' }).toUpperCase()
                          }
                          formatMonthYear={(locale: string | undefined, date: Date) => 
                            date.toLocaleDateString(locale, { month: 'long', year: 'numeric' })
                          }
                        />
                        
                        {calendarView !== 'month' && (
                          <div 
                            className="mt-2.5 sm:mt-3 flex justify-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => setCalendarView('month')}
                              className="px-2.5 sm:px-3 py-1 text-xs sm:text-sm bg-purple-100 text-purple-600 rounded font-medium hover:bg-purple-200 transition"
                            >
                              Back to Month View
                            </button>
                          </div>
                        )}
                        
                        <div 
                          className="flex items-center justify-between mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={clearDate}
                            className="px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                          >
                            Clear
                          </button>
                          <button
                            type="button"
                            onClick={setToday}
                            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 font-medium"
                          >
                            Today
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className={`text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2 transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-900'
                }`}>
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  Address
                </label>
                <Input
                  type="text"
                  value={userForm.address}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserForm({ ...userForm, address: e.target.value })}
                  placeholder="Enter full address"
                  className={`h-10 sm:h-11 text-sm sm:text-base transition-all duration-300 ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500/20'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500/20'
                  }`}
                />
              </div>
            </div>
              </div>
              
              <div className="h-4"></div>
              
              <div className="space-y-3 sm:space-y-4">
            <div className={`p-3 sm:p-4 rounded-xl border transition-all duration-300 ${
              isDarkMode 
                ? 'bg-gradient-to-br from-gray-800/50 to-gray-700/30 border-gray-600 shadow-lg shadow-gray-900/20' 
                : 'bg-gradient-to-br from-gray-50/50 to-white border-gray-200 shadow-lg shadow-gray-200/20'
            }`}>
              <div className={`flex items-center gap-2 sm:gap-3 pb-3 sm:pb-4 border-b transition-colors duration-300 ${
                isDarkMode ? 'border-gray-600' : 'border-gray-200'
              }`}>
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-gradient-to-br from-amber-600 to-orange-600 shadow-lg shadow-amber-500/30' 
                    : 'bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-400/30'
                }`}>
                  <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h3 className={`text-base sm:text-lg lg:text-xl font-bold transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Account Settings
                  </h3>
                  <p className={`text-xs sm:text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Configure user permissions and access levels
                  </p>
                </div>
              </div>
              <div key={editingUser ? `edit-${editingUser.username}` : 'add-new'} className="space-y-4 sm:space-y-6 mt-4 sm:mt-6 mb-6 sm:mb-8">
                <div className="space-y-3 sm:space-y-4">
                  <label className={`text-xs sm:text-sm font-semibold flex items-center gap-1.5 sm:gap-2 transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-900'
                  }`}>
                    <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 shadow-sm`}></div>
                    Role Assignment <span className="text-red-500 font-bold">*</span>
                  </label>
                  <div className="grid grid-cols-1 gap-2 sm:gap-3">
                    {roles.map((role) => (
                      <div
                        key={role.id}
                        className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
                          userForm.role === role.name
                            ? role.name === "admin" 
                              ? isDarkMode
                                ? "border-amber-500 bg-gradient-to-br from-amber-900/30 to-orange-900/20 shadow-lg shadow-amber-500/20"
                                : "border-amber-500 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg shadow-amber-200/30"
                              : role.name === "doctor"
                              ? isDarkMode
                                ? "border-green-500 bg-gradient-to-br from-green-900/30 to-emerald-900/20 shadow-lg shadow-green-500/20"
                                : "border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg shadow-green-200/30"
                              : role.name === "nurse"
                              ? isDarkMode
                                ? "border-blue-500 bg-gradient-to-br from-blue-900/30 to-cyan-900/20 shadow-lg shadow-blue-500/20"
                                : "border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-lg shadow-blue-200/30"
                              : isDarkMode
                              ? "border-gray-500 bg-gradient-to-br from-gray-700 to-gray-600 shadow-lg shadow-gray-500/20"
                              : "border-gray-500 bg-gradient-to-br from-gray-50 to-gray-100 shadow-lg shadow-gray-200/30"
                            : isDarkMode
                            ? "border-gray-600 hover:border-gray-500 bg-gray-800/50 hover:bg-gray-700/50 shadow-md shadow-gray-900/10"
                            : "border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 shadow-md shadow-gray-200/10"
                        }`}
                        onClick={() => setUserForm({ ...userForm, role: role.name })}
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-colors duration-300 ${
                            role.name === "admin" 
                              ? isDarkMode
                                ? "bg-amber-900 text-amber-300"
                                : "bg-amber-100 text-amber-600"
                              : role.name === "doctor"
                              ? isDarkMode
                                ? "bg-green-900 text-green-300"
                                : "bg-green-100 text-green-600"
                              : role.name === "nurse"
                              ? isDarkMode
                                ? "bg-blue-900 text-blue-300"
                                : "bg-blue-100 text-blue-600"
                              : isDarkMode
                              ? "bg-gray-700 text-gray-300"
                              : "bg-gray-100 text-gray-600"
                          }`}>
                            {getRoleIcon(role.name)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-semibold text-sm sm:text-base transition-colors duration-300 ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {role.name.toUpperCase()}
                            </h4>
                            <p className={`text-xs sm:text-sm transition-colors duration-300 truncate ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {role.description}
                            </p>
                          </div>
                          {userForm.role === role.name && (
                            <div className="ml-auto flex-shrink-0">
                              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {!editingUser && (
                  <div className="space-y-2">
                    <label className={`text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2 transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-900'
                    }`}>
                      <span className="w-2 h-2 bg-violet-500 rounded-full"></span>
                      Initial Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={userForm.password}
                        onChange={async (e: React.ChangeEvent<HTMLInputElement>) => {
                          setUserForm({ ...userForm, password: e.target.value });
                          if (!editingUser && e.target.value.trim()) {
                            await validateNewUserPassword();
                          }
                        }}
                        placeholder="Enter secure password"
                        autoComplete="new-password"
                        className={`h-10 sm:h-11 pr-9 sm:pr-10 text-sm sm:text-base transition-all duration-300 ${
                          formErrors.password 
                            ? 'border-red-500 focus:border-red-500' 
                            : isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-violet-500 focus:ring-violet-500/20'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-violet-500 focus:ring-violet-500/20'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                      </button>
                    </div>
                    {formErrors.password && (
                      <p className="text-xs sm:text-sm text-red-500 flex items-center gap-1">
                        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                        {formErrors.password}
                      </p>
                    )}
                    
                    {!editingUser && (
                      <div className={`p-2.5 sm:p-3 rounded-lg border transition-all duration-300 ${
                        isDarkMode 
                          ? 'bg-gray-800/50 border-gray-700' 
                          : 'bg-blue-50 border-blue-200'
                      }`}>
                        <p className={`text-xs font-medium mb-1.5 sm:mb-2 transition-colors duration-300 ${
                          isDarkMode ? 'text-blue-300' : 'text-blue-700'
                        }`}>
                          Password must be 8-50 characters with uppercase, lowercase, numbers:
                        </p>
                        <ul className={`text-xs space-y-0.5 sm:space-y-1 transition-colors duration-300 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          <li className="flex items-center gap-2">
                            <span className={`w-1 h-1 rounded-full ${
                              userForm.password.length >= 8 ? 'bg-green-500' : 'bg-gray-400'
                            }`}></span>
                            At least 8 characters
                          </li>
                          <li className="flex items-center gap-2">
                            <span className={`w-1 h-1 rounded-full ${
                              /[a-z]/.test(userForm.password) ? 'bg-green-500' : 'bg-gray-400'
                            }`}></span>
                            One lowercase letter
                          </li>
                          <li className="flex items-center gap-2">
                            <span className={`w-1 h-1 rounded-full ${
                              /[A-Z]/.test(userForm.password) ? 'bg-green-500' : 'bg-gray-400'
                            }`}></span>
                            One uppercase letter
                          </li>
                          <li className="flex items-center gap-2">
                            <span className={`w-1 h-1 rounded-full ${
                              /\d/.test(userForm.password) ? 'bg-green-500' : 'bg-gray-400'
                            }`}></span>
                            One number
                          </li>
                          <li className="flex items-center gap-2">
                            <span className={`w-1 h-1 rounded-full ${
                              !/\s/.test(userForm.password) ? 'bg-green-500' : 'bg-gray-400'
                            }`}></span>
                            No spaces
                          </li>
                        </ul>
                      </div>
                    )}
                    
                    <p className={`text-xs transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      User can change this password after first login
                    </p>
                  </div>
                )}

              </div>
            </div>

            <div className={`bg-gradient-to-r rounded-lg sm:rounded-xl p-3 sm:p-4 border transition-all duration-300 shadow-lg ${
              isDarkMode
                ? 'from-blue-900/30 to-violet-900/30 border-blue-600 shadow-blue-500/20'
                : 'from-blue-50 to-violet-50 border-blue-200 shadow-blue-200/30'
            }`}>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-colors duration-300 flex-shrink-0 ${
                  userForm.role === "admin" 
                    ? isDarkMode
                      ? "bg-amber-900 text-amber-300"
                      : "bg-amber-100 text-amber-600"
                    : userForm.role === "doctor"
                    ? isDarkMode
                      ? "bg-green-900 text-green-300"
                      : "bg-green-100 text-green-600"
                    : userForm.role === "nurse"
                    ? isDarkMode
                      ? "bg-blue-900 text-blue-300"
                      : "bg-blue-100 text-blue-600"
                    : isDarkMode
                    ? "bg-gray-700 text-gray-300"
                    : "bg-gray-100 text-gray-600"
                }`}>
                  {getRoleIcon(userForm.role)}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className={`font-semibold text-sm sm:text-base transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {userForm.role.toUpperCase()}
                  </h4>
                  <p className={`text-xs sm:text-sm transition-colors duration-300 truncate ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {roles.find(r => r.name === userForm.role)?.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
            </div>

          <DialogFooter className={`pt-3 sm:pt-4 border-t transition-colors duration-300 ${
            isDarkMode ? 'border-gray-600' : 'border-gray-200'
          }`}>
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 lg:gap-4 w-full">
              <Button 
                variant="outline" 
                onClick={handleCloseModal} 
                disabled={loading}
                className={`h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm transition-all duration-300 font-medium ${
                  isDarkMode
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-500 shadow-lg shadow-gray-900/20'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 shadow-lg shadow-gray-200/20'
                }`}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveUser} 
                disabled={loading}
                className="h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 font-medium"
              >
                {loading ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5 sm:mr-2"></div>
                    <span className="hidden sm:inline">Processing...</span>
                    <span className="sm:hidden">...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3 h-3 mr-1.5 sm:mr-2" />
                    <span className="hidden lg:inline">{editingUser ? "Update User Profile" : "Create New User"}</span>
                    <span className="lg:hidden">{editingUser ? "Update" : "Create"}</span>
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="w-[calc(100%-2rem)] sm:w-full max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">
              {userToToggle?.isActive ? "Lock Account?" : "Unlock Account?"}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Are you sure you want to {userToToggle?.isActive ? "lock" : "unlock"} the account "{userToToggle?.username}"?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 w-full">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setUserToToggle(null);
                }}
                className="text-xs sm:text-sm h-9 sm:h-10"
              >
                Cancel
              </Button>
              <Button 
                variant={userToToggle?.isActive ? "destructive" : "default"}
                onClick={confirmToggleStatus}
                className={`text-xs sm:text-sm h-9 sm:h-10 ${userToToggle?.isActive ? "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg shadow-violet-500/20 hover:shadow-xl hover:shadow-violet-500/30" : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-500/20 hover:shadow-xl hover:shadow-green-500/30"}`}
              >
                {userToToggle?.isActive ? "Lock Account" : "Unlock Account"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={isDarkMode ? "dark" : "light"}
        toastStyle={{
          borderRadius: '10px',
          boxShadow: isDarkMode 
            ? '0 10px 25px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)' 
            : '0 10px 25px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          border: 'none',
          fontSize: '13px',
          fontWeight: '500',
          padding: '12px 16px',
          minHeight: '50px',
          backdropFilter: 'blur(10px)',
        }}
        style={{
          top: '10px',
          right: '10px',
        }}
      />
    </>
  );
};

export default Accounts;
