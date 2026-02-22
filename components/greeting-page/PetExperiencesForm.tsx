import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card"

import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

import {Textarea} from "@/components/ui/textarea"

interface Props {
  value: string | null
  onChange: (value: string) => void
}

export default function PetExperiencesForm({ value, onChange }: Props) {
    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="text-xl font-semibold text-left">Pet Experience</CardTitle>
                <CardDescription className="text-md text-left">How much experience do you have with pets?</CardDescription>
            </CardHeader>
            <CardContent>
                <ToggleGroup
                type="single"
                size="sm"
                defaultValue="first-time"
                variant="outline"
                spacing={2}
                className="grid w-full grid-cols-3"
                value={value ?? undefined}
                onValueChange={(val) => {
                    if (val) onChange(val)
                }}
                >
                <ToggleGroupItem value="first-time">
                    First-time Owner
                </ToggleGroupItem>

                <ToggleGroupItem value="some-experience">
                    Some Experiences
                </ToggleGroupItem>

                <ToggleGroupItem value="experienced">
                    Experienced Owner
                </ToggleGroupItem>

                </ToggleGroup>

                <Textarea placeholder="Describe your experience(s) with pet" className="mt-4" />
            </CardContent>
        </Card>
    )
}
