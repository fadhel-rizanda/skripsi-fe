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
import {CalendarClock, MapPin, CalendarIcon, Video, MapPinned} from "lucide-react"
import {format} from "date-fns"
import {id} from "date-fns/locale"
import {cn} from "@/lib/utils"
import {useAdoptionStore} from "@/store/useAdoptionStore"
import {useDistrictsOptions, useProvincesOptions, useRegenciesOptions} from "@/hooks/useFilterOptions"
import {SearchableCombobox} from "@/components/combobox/SearchableCombobox"

const ONLINE_IDS = {province_id: "1", regency_id: "1", district_id: "1"} as const

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
    const [isOnline, setIsOnline] = useState(false)
    const triggerAdoptionRefresh = useAdoptionStore((s) => s.triggerAdoptionRefresh)

    const isMeetNGreet = context === "meet-n-greet"

    const form = useForm<CreateMeetNGreetInput>({
        resolver: zodResolver(CreateMeetNGreetSchema),
        mode: "onTouched",
        defaultValues: {
            scheduled_time: "",
            address: {
                street: "",
                province_id: "",
                regency_id: "",
                district_id: "",
                zip_code: "",
                notes: "",
                link: "",
            }
        }
    })

    const selectedProvinceId = form.watch("address.province_id")
    const selectedRegencyId = form.watch("address.regency_id")

    const {
        options: provinces,
        isLoading: isLoadingProvinces,
        setSearch: setProvincesSearch,
        loadMore: loadMoreProvinces,
        hasMore: hasMoreProvinces,
    } = useProvincesOptions()

    const {
        options: regencies,
        isLoading: isLoadingRegencies,
        setSearch: setRegenciesSearch,
        loadMore: loadMoreRegencies,
        hasMore: hasMoreRegencies,
    } = useRegenciesOptions(selectedProvinceId)

    const {
        options: districts,
        isLoading: isLoadingDistricts,
        setSearch: setDistrictsSearch,
        loadMore: loadMoreDistricts,
        hasMore: hasMoreDistricts,
    } = useDistrictsOptions(selectedRegencyId)

    const handleToggleOnline = (online: boolean) => {
        setIsOnline(online)
        if (online) {
            form.setValue("address.province_id", ONLINE_IDS.province_id, {shouldValidate: true})
            form.setValue("address.regency_id", ONLINE_IDS.regency_id, {shouldValidate: true})
            form.setValue("address.district_id", ONLINE_IDS.district_id, {shouldValidate: true})
            form.setValue("address.zip_code", "00000", {shouldValidate: true})
        } else {
            form.setValue("address.province_id", "", {shouldValidate: false})
            form.setValue("address.regency_id", "", {shouldValidate: false})
            form.setValue("address.district_id", "", {shouldValidate: false})
            form.setValue("address.zip_code", "", {shouldValidate: false})
        }
    }

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
                await overrideSubmit(data)
            } else if (existing?.id) {
                await meetNGreetServices.updateMeetNGreet(adoptionId, existing.id, data)
            } else {
                await meetNGreetServices.createMeetNGreet(adoptionId, data)
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to schedule")
            throw error
        } finally {
            triggerAdoptionRefresh()
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

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                            <MapPin className="h-4 w-4"/>
                            Location
                        </div>

                        {isMeetNGreet && (
                            <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg">
                                <button
                                    type="button"
                                    onClick={() => handleToggleOnline(false)}
                                    className={cn(
                                        "flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all",
                                        !isOnline
                                            ? "bg-white shadow-sm text-slate-800"
                                            : "text-slate-500 hover:text-slate-700"
                                    )}
                                >
                                    <MapPinned className="h-3.5 w-3.5"/>
                                    In-Person
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleToggleOnline(true)}
                                    className={cn(
                                        "flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all",
                                        isOnline
                                            ? "bg-white shadow-sm text-slate-800"
                                            : "text-slate-500 hover:text-slate-700"
                                    )}
                                >
                                    <Video className="h-3.5 w-3.5"/>
                                    Online
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">

                        <FormField
                            control={form.control}
                            name="address.street"
                            render={({field}) => (
                                <FormItem className="col-span-2">
                                    <FormLabel>
                                        {isOnline ? "Meeting Title / Platform" : "Street Address"}
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder={isOnline
                                                ? "e.g. Google Meet — Puppy Introduction"
                                                : "Jl. Pawsitive No. 123"
                                            }
                                            {...field}
                                            className="rounded-xl"
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        {!isOnline && (
                            <>
                                <FormField
                                    control={form.control}
                                    name="address.province_id"
                                    render={({field}) => (
                                        <FormItem className="col-span-2">
                                            <FormLabel>Province</FormLabel>
                                            <FormControl>
                                                <SearchableCombobox
                                                    options={provinces}
                                                    selectedValues={field.value ? [field.value] : []}
                                                    onSelect={(value) => {
                                                        field.onChange(value)
                                                        form.setValue("address.regency_id", "")
                                                        form.setValue("address.district_id", "")
                                                    }}
                                                    onSearch={setProvincesSearch}
                                                    onLoadMore={loadMoreProvinces}
                                                    isLoading={isLoadingProvinces}
                                                    hasMore={hasMoreProvinces}
                                                    placeholder="Select province..."
                                                    emptyMessage="No provinces found."
                                                    mode="single"
                                                />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="address.regency_id"
                                    render={({field}) => (
                                        <FormItem className="col-span-2">
                                            <FormLabel>Regency / City</FormLabel>
                                            <FormControl>
                                                <SearchableCombobox
                                                    options={regencies}
                                                    selectedValues={field.value ? [field.value] : []}
                                                    onSelect={(value) => {
                                                        field.onChange(value)
                                                        form.setValue("address.district_id", "")
                                                    }}
                                                    onSearch={setRegenciesSearch}
                                                    onLoadMore={loadMoreRegencies}
                                                    isLoading={isLoadingRegencies}
                                                    hasMore={hasMoreRegencies}
                                                    placeholder={selectedProvinceId ? "Select regency/city..." : "Select a province first"}
                                                    emptyMessage="No regencies found."
                                                    mode="single"
                                                    disabled={!selectedProvinceId}
                                                />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="address.district_id"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>District</FormLabel>
                                            <FormControl>
                                                <SearchableCombobox
                                                    options={districts}
                                                    selectedValues={field.value ? [field.value] : []}
                                                    onSelect={(value) => field.onChange(value)}
                                                    onSearch={setDistrictsSearch}
                                                    onLoadMore={loadMoreDistricts}
                                                    isLoading={isLoadingDistricts}
                                                    hasMore={hasMoreDistricts}
                                                    placeholder={selectedRegencyId ? "Select district..." : "Select a regency first"}
                                                    emptyMessage="No districts found."
                                                    mode="single"
                                                    disabled={!selectedRegencyId}
                                                />
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
                                            <FormLabel>
                                                Zip Code{" "}
                                                <span className="text-muted-foreground font-normal">(optional)</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input placeholder="17148" {...field} className="rounded-xl"/>
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                            </>
                        )}

                        <FormField
                            control={form.control}
                            name="address.link"
                            render={({field}) => (
                                <FormItem className="col-span-2">
                                    <FormLabel>
                                        {isOnline ? "Meeting Link" : "Maps Link"}{" "}
                                        {!isOnline && (
                                            <span className="text-muted-foreground font-normal">(optional)</span>
                                        )}
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder={isOnline
                                                ? "https://meet.google.com/..."
                                                : "https://maps.google.com/..."
                                            }
                                            {...field}
                                            className="rounded-xl"
                                        />
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
                                    <FormLabel>
                                        Notes{" "}
                                        <span className="text-muted-foreground font-normal">(optional)</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder={isOnline
                                                ? "e.g. We'll use Google Meet, link will be sent 10 minutes before"
                                                : "e.g. Near the orange gate, ring the bell twice"
                                            }
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