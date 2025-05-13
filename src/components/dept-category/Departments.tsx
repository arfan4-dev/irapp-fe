import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { deleteDepartment, fetchDepartments } from "@/store/features/department/department";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { MoreVertical } from "lucide-react";
import { toast } from "sonner";
const Departments = ({ search, setSearch, filtered, newDeptInput, setNewDeptInput, newDeptModalOpen, setNewDeptModalOpen, handleCreate,setSelectedDept, selectedDept, editDept, inputRef, setEditDept, handleUpdate, editLoading, loader, setDeleteLoading, deleteLoading }:any) => {
        const dispatch = useDispatch<AppDispatch>();
    
  return (
    <div>
          <div className="hidden md:flex  flex-col">
             <div className="flex justify-between items-center mb-6">
                                <h2 className="text-[18px] lg:text-2xl font-bold">Department Management</h2>
                                <Dialog open={newDeptModalOpen} onOpenChange={setNewDeptModalOpen}>
                                    <DialogTrigger asChild>
                                        <Button className='cursor-pointer hover:opacity-75'>+ Add Department</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Create New Department</DialogTitle>
                                        </DialogHeader>
                                        <form onSubmit={handleCreate}>
                                            <Input
                                                placeholder="Enter department name"
                                                value={newDeptInput}
                                                onChange={(e) => setNewDeptInput(e.target.value)}
                                            />
                                            <Button className="mt-4 w-full cursor-pointer" type='submit' disabled={loader}>
                                                {loader ? 'Saving...' : 'Create'}
                                            </Button>
                                        </form>
            
                                    </DialogContent>
                                </Dialog>
                            </div>
              <div className="flex-1 flex flex-col bg-white dark:bg-zinc-800 rounded-lg border">
                 <div className="flex items-center justify-between">
                  
                 <p className="text-muted-foreground text-sm mb-2 px-4">
  Home / Admin Panel / <span className="font-medium text-black dark:text-white">Departments</span>
</p>




                      <Input
                          placeholder="Search department"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="m-4 w-[200px] placeholder:text-[12px]"
                      />
                 </div>
                

                  {/* <p className="text-sm text-muted-foreground mb-2 px-4">
                      Showing {filtered.length} of {departments.length} departments
                  </p> */}
                  <div className="flex-1 px-4 overflow-y-auto">
                      <Table className="">
                          <TableHeader>
                              <TableRow>
                                  <TableHead>Name</TableHead>
                                  <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                          </TableHeader>
                          <TableBody>
                             
                              {filtered.length === 0 ? (
                                  <TableRow>
                                      <TableCell colSpan={2} className="text-center italic text-gray-500">
                                          {search ? "No matching departments found." : "No departments created yet."}
                                      </TableCell>
                                  </TableRow>
                              ) : (
                                  filtered.map((dept:any) => (
                                      <TableRow
                                          key={dept._id}
                                          onClick={() => setSelectedDept(dept.name)}
                                          className={`cursor-pointer transition-all duration-150 
                                                 ${selectedDept === dept.name ? "bg-blue-100 dark:bg-zinc-700 font-semibold" : "hover:bg-gray-100 dark:hover:bg-zinc-800"}`}
                                      >
                                          
                                          <TableCell>
                                              {editDept?.id === dept._id ? (
                                                  <div className="flex flex-col gap-2">
                                                      <Input
                                                          ref={inputRef}
                                                          className="h-9 w-[200px]"
                                                          value={editDept.name}
                                                          onChange={(e) => {
                                                              const value = e.target.value;
                                                              // Allow letters, numbers, and spaces
                                                              const isValid = /^[a-zA-Z0-9 ]*$/.test(value);
                                                              if (!isValid) {
                                                                  toast.error("Only letters, numbers, and spaces are allowed.");
                                                                  return;
                                                              }

                                                              setEditDept((prev: any) => ({ ...prev!, name: value }));
                                                          }}
                                                          
                                                          onKeyDown={(e) => {
                                                              if (e.key === "Enter") {
                                                                  handleUpdate();
                                                              }
                                                          }}
                                                      />
                                                      
                                                      <div className="flex flex-end gap-2">
                                                          <Button 
                                                              className="cursor-pointer"
                                                              size="sm"
                                                              onClick={handleUpdate}
                                                              disabled={editLoading || loader}
                                                          >
                                                              {editLoading ? "Saving..." : "Save"}
                                                          </Button>
                                                          <Button
                                                              size="sm"
                                                              className="cursor-pointer"
                                                              variant="outline"
                                                              onClick={() => setEditDept(null)}
                                                          >
                                                              Cancel
                                                          </Button>
                                                      </div>
                                                  </div>

                                              ) : (
                                                  <span className="hover:underline ">{dept.name}</span>
                                              )}
                                          </TableCell>


                                          <TableCell className="text-end">
                                              {editDept?.id === dept._id ? (
                                                  <></>
                                              ) : (
                                                  <DropdownMenu>
                                                      <DropdownMenuTrigger asChild>
                                                          <Button size="icon" variant="ghost" className="cursor-pointer"><MoreVertical /></Button>
                                                      </DropdownMenuTrigger>
                                                      <DropdownMenuContent align="end">
                                                          <DropdownMenuItem onClick={() => setEditDept({ id: dept._id, name: dept.name })}>Edit</DropdownMenuItem>
                                                          {/* <DropdownMenuItem
                                                                         
                                                                        onClick={() => setFeedbackModal({
                                                                            open: true,
                                                                            type: "delete",
                                                                            title: "Delete Department?",
                                                                            message: `Are you sure you want to delete \"${dept.name}\"? This action cannot be undone.`,
                                                                            onConfirm: () => {
                                                                                dispatch(deleteDepartment(dept._id))
                                                                                    .unwrap()
                                                                                    .then(() => {
                                                                                        if (selectedDept === dept.name) {
                                                                                            setSelectedDept(null);
                                                                                        }

                                                                                        // ✅ Immediately update the list manually if fetch doesn't help
                                                                                        const updated = departments.filter(d => d._id !== dept._id);
                                                                                        dispatch({ type: "departments/setDepartments", payload: updated }); // <-- assumes slice has `setDepartments` reducer

                                                                                        // Re-fetch for sync
                                                                                        dispatch(fetchDepartments());

                                                                                        setFeedbackModal({
                                                                                            open: true,
                                                                                            type: "delete",
                                                                                            title: "Department Deleted",
                                                                                            message: `Department "${dept.name}" has been successfully removed.`,
                                                                                        });
                                                                                    })

                                                                                    .catch(() => toast.error("Failed to delete department."));
                                                                            }

                                                                        })}
                                                                        className="text-red-600"
                                                                    >
                                                                        Delete
                                                                    </DropdownMenuItem> */}
                                                              
                                                          <DropdownMenuItem
                                                              onClick={() => {
                                                                  setDeleteLoading(true)
                                                                  dispatch(deleteDepartment(dept._id))
                                                                      .unwrap()
                                                                      .then(() => {
                                                                          if (selectedDept === dept.name) {
                                                                              setSelectedDept(null); // Clear selected department
                                                                          }
                                                                          setDeleteLoading(false)
                                                                          // Remove manual state update
                                                                          // dispatch({ type: "departments/setDepartments", payload: updated });

                                                                          // Re-fetch departments to ensure sync
                                                                          return dispatch(fetchDepartments()).unwrap(); // Ensure fetch completes
                                                                      })

                                                                      .catch((error) => {
                                                                          console.error("Delete department failed:", error);
                                                                          setDeleteLoading(false)
                                                                          toast.error("Failed to delete department.");
                                                                      })
                                                              }}
                                                              className="text-red-600"
                                                              disabled={deleteLoading}
                                                          >
                                                              {deleteLoading ? "Deleting..." : "Delete"}
                                                          </DropdownMenuItem>
                                                      </DropdownMenuContent>
                                                  </DropdownMenu>
                                              )}
                                          </TableCell>
                                      </TableRow>
                                  ))
                              )}
                          </TableBody>
                      </Table>
                  </div>

              </div>
          </div>
    </div>
  )
}

export default Departments