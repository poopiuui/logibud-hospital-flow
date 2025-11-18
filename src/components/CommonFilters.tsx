import { Search, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface CommonFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  
  // Year filter
  yearFilter?: string;
  onYearChange?: (value: string) => void;
  availableYears?: number[];
  
  // Month filter
  monthFilter?: string;
  onMonthChange?: (value: string) => void;
  availableMonths?: string[];
  
  // Status filter
  statusFilter?: string;
  onStatusChange?: (value: string) => void;
  statusOptions?: { value: string; label: string }[];
  
  // Sort order
  sortOrder?: 'asc' | 'desc';
  onSortToggle?: () => void;
  
  // Custom filters
  customFilters?: React.ReactNode;
}

export const CommonFilters = ({
  searchTerm,
  onSearchChange,
  searchPlaceholder = "검색...",
  yearFilter,
  onYearChange,
  availableYears = [],
  monthFilter,
  onMonthChange,
  availableMonths = [],
  statusFilter,
  onStatusChange,
  statusOptions = [],
  sortOrder,
  onSortToggle,
  customFilters,
}: CommonFiltersProps) => {
  return (
    <div className="flex flex-wrap gap-4 mb-6">
      {/* Search Input */}
      <div className="flex-1 min-w-[200px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Year Filter */}
      {yearFilter !== undefined && onYearChange && (
        <Select value={yearFilter} onValueChange={onYearChange}>
          <SelectTrigger className="w-[140px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue placeholder="년도" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 년도</SelectItem>
            {availableYears.map(year => (
              <SelectItem key={year} value={year.toString()}>{year}년</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Month Filter */}
      {monthFilter !== undefined && onMonthChange && (
        <Select value={monthFilter} onValueChange={onMonthChange}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="월" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 월</SelectItem>
            {availableMonths.map(month => (
              <SelectItem key={month} value={month}>{month}월</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Status Filter */}
      {statusFilter !== undefined && onStatusChange && statusOptions.length > 0 && (
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="상태 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            {statusOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Custom Filters */}
      {customFilters}

      {/* Sort Order Toggle */}
      {sortOrder !== undefined && onSortToggle && (
        <Button 
          variant="outline" 
          onClick={onSortToggle}
          className="shrink-0"
        >
          {sortOrder === 'desc' ? (
            <>
              <ChevronDown className="h-4 w-4 mr-2" />
              최신순
            </>
          ) : (
            <>
              <ChevronUp className="h-4 w-4 mr-2" />
              오래된순
            </>
          )}
        </Button>
      )}
    </div>
  );
};
