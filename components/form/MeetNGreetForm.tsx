"use client"

import {useState} from "react"
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form"
import {Input} from "@/components/ui/input"
import {Button} from "@/components/ui/button"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover"
import {Calendar} from "@/components/ui/calendar"
import {Textarea} from "@/components/ui/textarea"
import {MeetNGreet} from "@/types/adoption"
import {CreateMeetNGreetInput, CreateMeetNGreetSchema} from "@/schemas/adoption.schema"
import {ActionDialog} from "@/components/dialog/ActionDialog"
import {meetNGreetServices} from "@/services/adoptionServices"
import {toast} from "sonner"
import {CalendarClock, MapPin, CalendarIcon} from "lucide-react"
import {format} from "date-fns"
import {id} from "date-fns/locale"
import {cn} from "@/lib/utils"
import {useAdoptionStore} from "@/store/useAdoptionStore";

interface Props {
    adoptionId: string;
    existing?: MeetNGreet;
    onSuccess: () => void;
    context?: "meet-n-greet" | "handover";
    overrideSubmit?: (data: CreateMeetNGreetInput) => Promise<any>;
}

export function MeetNGreetForm({adoptionId, existing, onSuccess, context, overrideSubmit}: Props) {
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [calendarOpen, setCalendarOpen] = useState(false)
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
    const [selectedTime, setSelectedTime] = useState("09:00")
    const triggerAdoptionRefresh = useAdoptionStore((s) => s.triggerAdoptionRefresh);

    const form = useForm<CreateMeetNGreetInput>({
        resolver: zodResolver(CreateMeetNGreetSchema),
        mode: "onTouched",
        defaultValues: {
            scheduled_time: "",
            address: {
                street: "", city: "", state: "",
                country: "", zip_code: "", notes: "", link: ""
            }
        }
    })

    const handleDateSelect = (date: Date | undefined) => {
        setSelectedDate(date)
        setCalendarOpen(false)
        if (date) {
            const [hours, minutes] = selectedTime.split(":")
            const combined = new Date(date)
            combined.setHours(parseInt(hours), parseInt(minutes))
            form.setValue("scheduled_time", combined.toISOString(), {shouldValidate: true})
        }
    }

    const handleTimeChange = (time: string) => {
        setSelectedTime(time)
        if (selectedDate) {
            const [hours, minutes] = time.split(":")
            const combined = new Date(selectedDate)
            combined.setHours(parseInt(hours), parseInt(minutes))
            form.setValue("scheduled_time", combined.toISOString(), {shouldValidate: true})
        }
    }

    const onSubmit = () => setConfirmOpen(true)

    const handleFinalSubmit = async () => {
        setIsSubmitting(true)
        try {
            const data = form.getValues()
            if (overrideSubmit) {
                await overrideSubmit(data)                                    // pakai override kalau ada
            } else if (existing?.id) {
                await meetNGreetServices.updateMeetNGreet(adoptionId, existing.id, data)
            } else {
                await meetNGreetServices.createMeetNGreet(adoptionId, data)
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to schedule")
            throw error
        } finally {
            setIsSubmitting(false)
        }
    }

    const isUpdate = !!existing?.id
    const isHandover = context === "handover"

    const buttonText = isHandover
        ? (isUpdate ? "Propose New Handover Schedule" : "Schedule Handover Day")
        : (isUpdate ? "Propose New Schedule" : "Confirm Meet & Greet")

    const dialogTitle = isHandover
        ? (isUpdate ? "Propose New Handover Schedule?" : "Schedule Handover Day?")
        : (isUpdate ? "Propose New Schedule?" : "Schedule Meet & Greet?")

    const dialogSuccess = isHandover
        ? (isUpdate ? "New Handover Schedule Proposed!" : "Handover Day Scheduled!")
        : (isUpdate ? "New Schedule Proposed!" : "Meeting Scheduled!")
    return (
        <>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

                    {/* Section: Schedule Time */}
                    <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                        <CalendarClock className="h-4 w-4"/>
                        Schedule Time
                    </div>

                    <FormField
                        control={form.control}
                        name="scheduled_time"
                        render={() => (
                            <FormItem>
                                <FormLabel>Date & Time</FormLabel>
                                <div className="flex gap-2">
                                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "flex-1 justify-start text-left font-normal rounded-xl",
                                                    !selectedDate && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4"/>
                                                {selectedDate
                                                    ? format(selectedDate, "d MMMM yyyy", {locale: id})
                                                    : "Pick a date"
                                                }
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={selectedDate}
                                                onSelect={handleDateSelect}
                                                disabled={(date) => date < new Date()}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <Input
                                        type="time"
                                        value={selectedTime}
                                        onChange={(e) => handleTimeChange(e.target.value)}
                                        className="w-32 rounded-xl"
                                    />
                                </div>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <hr/>

                    {/* Section: Location */}
                    <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                        <MapPin className="h-4 w-4"/>
                        Location
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="address.street"
                            render={({field}) => (
                                <FormItem className="col-span-2">
                                    <FormLabel>Street Address</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Jl. Pawsitive No. 123" {...field} className="rounded-xl"/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="address.city"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>City</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Bekasi" {...field} className="rounded-xl"/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="address.zip_code"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Zip Code</FormLabel>
                                    <FormControl>
                                        <Input placeholder="17148" {...field} className="rounded-xl"/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="address.state"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>State / Province</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Jawa Barat" {...field} className="rounded-xl"/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="address.country"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Country</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Indonesia" {...field} className="rounded-xl"/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="address.link"
                            render={({field}) => (
                                <FormItem className="col-span-2">
                                    <FormLabel>Maps Link <span
                                        className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://maps.google.com/..." {...field}
                                               className="rounded-xl"/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="address.notes"
                            render={({field}) => (
                                <FormItem className="col-span-2">
                                    <FormLabel>Notes <span
                                        className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="e.g. Near the orange gate, ring the bell twice"
                                            className="rounded-xl resize-none"
                                            rows={3}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                    </div>

                    <Button type="submit" className="w-full rounded-lg bg-[#19E619] hover:bg-green-500 text-black mt-2">
                        {buttonText}
                    </Button>
                </form>
            </Form>

            <ActionDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                onConfirm={handleFinalSubmit}
                onContinue={onSuccess}
                title={dialogTitle}
                description="This will notify the other party about the schedule."
                confirmText={isUpdate ? "Propose Now" : "Schedule Now"}
                successTitle={dialogSuccess}
                successDescription="The schedule has been successfully set."
            />
        </>
    )
}