// Named exports for optimal tree-shaking
// Core UI components - only export what exists
export { Button, buttonVariants } from './button'
export { Input } from './input'
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './card'
export { Badge, badgeVariants } from './badge'
export { Separator } from './separator'

// Dialog components
export { 
  Dialog, 
  DialogClose,
  DialogPortal, 
  DialogOverlay, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader, 
  DialogFooter, 
  DialogTitle, 
  DialogDescription 
} from './dialog'

// Alert Dialog components  
export {
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from './alert-dialog'

// Sheet components
export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from './sheet'

// Form components
export {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
} from './form'

// Table components
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from './table'

// Other commonly used components - simplified to avoid export mismatches
export { Label } from './label'
export { Textarea } from './textarea'
export { Switch } from './switch'
export { Skeleton } from './skeleton'
export { Avatar, AvatarImage, AvatarFallback } from './avatar'
export { Alert, AlertDescription, AlertTitle } from './alert'
export { Toaster } from './sonner'

// Re-export these as wildcard since they have many sub-exports
export * from './dropdown-menu'
export * from './select'
export * from './pagination' 
export * from './tabs'
export * from './popover'
export * from './command'