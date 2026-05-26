"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

type ExportCsvButtonProps = {
  disabled?: boolean;
  onExport: () => void;
};

export function ExportCsvButton({ disabled, onExport }: ExportCsvButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="shrink-0"
      disabled={disabled}
      title={disabled ? "No records to export" : undefined}
      onClick={onExport}
    >
      <Download className="h-4 w-4 sm:mr-2" />
      <span className="hidden sm:inline">Export CSV</span>
    </Button>
  );
}
