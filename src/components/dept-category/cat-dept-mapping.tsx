import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Check, X } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import { updateCategoryDepartments } from '@/store/features/category/category';
import { toast } from 'sonner';

function MultiSelectDropdown({ options, value, onChange, placeholder }: any) {
    const toggleValue = (val: any) => {
        const exists = value.includes(val);
        const updated = exists ? value.filter((v: any) => v !== val) : [...value, val];
        onChange(updated);
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                    {value.length > 0 ? `${value.length} selected` : placeholder}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-0">
                <Command>
                    <CommandInput placeholder="Search..." className="h-9" />
                    <CommandGroup>
                        {options.map((opt: any) => (
                            <CommandItem
                                key={opt.value}
                                onSelect={() => toggleValue(opt.value)}
                                className="flex justify-between"
                            >
                                <span>{opt.label}</span>
                                {value.includes(opt.value) && <Check className="h-4 w-4" />}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

export default function CategoryDepartmentMapping({ departments, categories }: any) {
    const dispatch = useDispatch<AppDispatch>();

    const deptOptions = departments.map((dep: any) => ({
        label: dep.name,
        value: dep._id,
    }));

    const [mapping, setMapping] = useState<any[]>([]);

    useEffect(() => {
        if (categories?.length) {
            const dynamicMap = categories.map((cat: any) => ({
                _id: cat._id,
                category: cat.label,
                departments: cat.departments || [],
                items: cat.items.map((i: any) => i._id) || [],
            }));
            setMapping(dynamicMap);
        }
    }, [categories]);

    const handleUpdateDepartments = async (index: any, newDeps: any) => {
        const updated = [...mapping];
        updated[index].departments = newDeps;
        setMapping(updated);

        try {
            await dispatch(updateCategoryDepartments({
                categoryId: updated[index]._id,
                departments: newDeps,
            })).unwrap();
            toast.success(`Departments updated for ${updated[index].category}`);
        } catch (err: any) {
            toast.error(err || 'Failed to update departments');
        }
    };

    const handleRemoveDep = (catIdx: any, depToRemove: any) => {
        const updated = [...mapping];
        const newDeps = updated[catIdx].departments.filter((dep: any) => dep !== depToRemove);
        handleUpdateDepartments(catIdx, newDeps); // reuse update logic
    };

    return (
        <div className="p-6">
            <Card className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-muted">
                        <tr className="text-left border-b">
                            <th className="p-3 font-semibold">Category</th>
                            <th className="p-3 font-semibold">Departments</th>
                            <th className="p-3 font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mapping.map((entry, index) => (
                            <tr key={entry._id} className="border-b align-top">
                                <td className="p-3 font-medium text-base">{entry.category}</td>
                                <td className="p-3">
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {entry.departments.map((depId: string) => {
                                            const dep = departments.find((d: any) => d._id === depId);
                                            return (
                                                <div
                                                    key={depId}
                                                    className="flex items-center px-2 py-1 border rounded bg-muted"
                                                >
                                                    <span>{dep?.name || depId}</span>
                                                    <button
                                                        onClick={() => handleRemoveDep(index, depId)}
                                                        className="ml-2 text-red-500 hover:text-red-700"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </td>
                                <td className="p-3">
                                    <MultiSelectDropdown
                                        options={deptOptions}
                                        value={entry.departments}
                                        onChange={(selected: any) => handleUpdateDepartments(index, selected)}
                                        placeholder="Select departments"
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
}
