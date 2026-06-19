import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CaretDown, UploadSimple } from "phosphor-react";
import { useState } from "react";
import SpeciesAutocomplete from "./SpeciesAutocomplete.shadcn";

export type FishRecord = {
  id: string;
  name: string;
  count: number;
  tankId: string;
  imageUrl?: string;
  maxSizeCm?: number | null;
  bioload?: number | null;
  addedAt: number;
};

type Tank = {
  id: string;
  name: string;
};

type Props = {
  tanks: Tank[];
  userId: string | null;
  fishes: FishRecord[];
  editFishId?: string | null;
  onSave: (fish: FishRecord) => void;
  onDelete: (fishId: string) => void;
  onUploadImage: (file: File) => Promise<string | undefined>;
  tankNameLookup: (id: string) => string;
};

export default function FishManager({
  tanks,
  userId,
  fishes,
  editFishId,
  onSave,
  onDelete: _onDelete,
  onUploadImage,
  tankNameLookup: _tankNameLookup,
}: Props) {
  const [draftFish, setDraftFish] = useState<Partial<FishRecord>>({ count: 6 });
  const [editingFishId, setEditingFishId] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Sync edit state from parent prop (React 19 pattern - no useEffect)
  const [prevEditFishId, setPrevEditFishId] = useState(editFishId);
  if (editFishId !== prevEditFishId) {
    setPrevEditFishId(editFishId);
    if (editFishId) {
      const fish = fishes.find((f) => f.id === editFishId);
      if (fish) {
        setDraftFish({
          name: fish.name,
          count: fish.count,
          tankId: fish.tankId,
          imageUrl: fish.imageUrl,
          maxSizeCm: fish.maxSizeCm,
          bioload: fish.bioload,
          addedAt: fish.addedAt,
        });
        setEditingFishId(fish.id);
        setImagePreview(fish.imageUrl || null);
      }
    }
  }

  async function saveFish() {
    if (!draftFish.name || !draftFish.tankId || !draftFish.count) return;

    const fishData: FishRecord = {
      id: editingFishId || crypto.randomUUID(),
      name: draftFish.name,
      count: Number(draftFish.count),
      tankId: draftFish.tankId,
      imageUrl: draftFish.imageUrl,
      maxSizeCm: draftFish.maxSizeCm ?? null,
      bioload: draftFish.bioload ?? null,
      addedAt: draftFish.addedAt ?? Date.now(),
    };

    onSave(fishData);
    setDraftFish({ count: 6 });
    setEditingFishId(null);
    setImagePreview(null);
    setShowAdvanced(false);
  }

  function cancelEdit() {
    setEditingFishId(null);
    setDraftFish({ count: 6 });
    setImagePreview(null);
    setShowAdvanced(false);
  }

  async function handleUploadImage(file: File) {
    if (!userId) return;
    setUploadStatus("Uploading photo…");
    const url = await onUploadImage(file);
    setUploadStatus("");
    if (url) {
      setDraftFish((prev) => ({ ...prev, imageUrl: url }));
      setImagePreview(url);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-primary uppercase tracking-wide">
              Fish & photos
            </div>
            <CardTitle>Add fish with autocomplete</CardTitle>
          </div>
          <Badge variant="outline">Upload photos</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Main Form Fields */}
        <div className="space-y-4">
          <SpeciesAutocomplete
            value={draftFish.name ?? ""}
            onChange={(v, meta) =>
              setDraftFish((prev) => ({
                ...prev,
                name: v,
                maxSizeCm: meta?.maxSizeCm ?? prev.maxSizeCm,
                bioload: meta?.bioload ?? prev.bioload,
              }))
            }
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fish-count">Count</Label>
              <Input
                id="fish-count"
                type="number"
                value={draftFish.count ?? ""}
                onChange={(e) =>
                  setDraftFish({ ...draftFish, count: Number(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fish-tank">Tank</Label>
              <Select
                value={draftFish.tankId ?? ""}
                onValueChange={(value) =>
                  setDraftFish({ ...draftFish, tankId: value })
                }
              >
                <SelectTrigger id="fish-tank">
                  <SelectValue placeholder="Select a tank" />
                </SelectTrigger>
                <SelectContent>
                  {tanks.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Advanced Options Toggle */}
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="gap-2"
          >
            ⚙️ Advanced Options
            <CaretDown
              className={`h-4 w-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`}
            />
          </Button>
          {showAdvanced && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fish-maxsize">Max size (cm)</Label>
                  <Input
                    id="fish-maxsize"
                    type="number"
                    step="0.1"
                    value={draftFish.maxSizeCm ?? ""}
                    onChange={(e) =>
                      setDraftFish({
                        ...draftFish,
                        maxSizeCm: e.target.value
                          ? Number(e.target.value)
                          : null,
                      })
                    }
                    placeholder="Auto from species"
                  />
                  <p className="text-xs text-muted-foreground">
                    Auto-filled from species database
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fish-bioload">Bioload per fish</Label>
                  <Input
                    id="fish-bioload"
                    type="number"
                    step="0.1"
                    value={draftFish.bioload ?? ""}
                    onChange={(e) =>
                      setDraftFish({
                        ...draftFish,
                        bioload: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    placeholder="Auto calculated"
                  />
                  <p className="text-xs text-muted-foreground">
                    Auto-calculated if not specified
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fish-added">Date added</Label>
                <Input
                  id="fish-added"
                  type="date"
                  value={
                    draftFish.addedAt
                      ? new Date(draftFish.addedAt).toISOString().split("T")[0]
                      : new Date().toISOString().split("T")[0]
                  }
                  onChange={(e) =>
                    setDraftFish({
                      ...draftFish,
                      addedAt: new Date(e.target.value).getTime(),
                    })
                  }
                />
              </div>
              <p className="text-sm text-muted-foreground">
                💡 <strong>Max size</strong> and <strong>bioload</strong> are
                auto-filled from species database. Override them here if you
                have more accurate values.
              </p>
            </div>
          )}
        </div>

        {/* Image Upload */}
        <div>
          <Button variant="outline" className="w-full gap-2" asChild>
            <label>
              <UploadSimple className="h-4 w-4" />
              Upload your photo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  e.target.files?.[0] && handleUploadImage(e.target.files[0])
                }
              />
            </label>
          </Button>
        </div>

        {uploadStatus && (
          <p className="text-sm text-muted-foreground">{uploadStatus}</p>
        )}

        {imagePreview && (
          <img
            src={imagePreview}
            alt="Selected"
            className="w-full rounded-lg max-h-[300px] object-cover"
          />
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button onClick={saveFish} className="flex-1">
            {editingFishId ? "Update fish" : "Save fish"}
          </Button>
          {editingFishId && (
            <Button variant="outline" onClick={cancelEdit} className="flex-1">
              Cancel edit
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
