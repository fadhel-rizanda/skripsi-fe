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
import { Checkbox } from "@/components/ui/checkbox"

interface Props {
  value: string | null
  onChange: (value: string) => void
}

export default function PetPreferencesForm({ value, onChange }: Props) {
    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="text-xl font-semibold text-left">Pet Preferences</CardTitle>
                <CardDescription className="text-md text-left">Select any tags that apply to your ideal pet</CardDescription>
            </CardHeader>
            <CardContent>
                <ToggleGroup
                type="single"
                size="sm"
                defaultValue="small"
                variant="outline"
                spacing={2}
                className="grid w-full grid-cols-5"
                value={value ?? undefined}
                onValueChange={(val) => {
                    if (val) onChange(val)
                }}
                >
                <ToggleGroupItem value="small">
                    Small
                </ToggleGroupItem>

                <ToggleGroupItem value="medium">
                    Medium
                </ToggleGroupItem>

                <ToggleGroupItem value="large">
                    Large
                </ToggleGroupItem>

                <ToggleGroupItem value="high-energy">
                    High Energy
                </ToggleGroupItem>

                <ToggleGroupItem value="low-energy">
                    Low Energy
                </ToggleGroupItem>

                </ToggleGroup>

                <Textarea placeholder="What kind of pet do you want to adopt?" className="mt-4" />

                <div className="flex items-center space-x-2 mt-4">
                    <Checkbox />
                    <span className="text-sm text-black">I'm open to pets with special needs</span>
                </div>
            </CardContent>
        </Card>
    )
}
