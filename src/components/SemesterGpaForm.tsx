import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, GraduationCap } from 'lucide-react';
import { useCGPA, Semester, GPACalculationMethod } from '@/context/CGPAContext';
import { useToast } from '@/components/ui/use-toast';

const SemesterItem: React.FC<{ semester: Semester; showCreditHours: boolean }> = ({ 
  semester, 
  showCreditHours 
}) => {
  const { updateSemester, removeSemester, state } = useCGPA();
  const { toast } = useToast();
  const semesters = state.semesters || [];

  const handleGPAChange = (value: string) => {
    if (value === '') {
      updateSemester({ ...semester, gpa: '' });
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue >= 0 && numValue <= 5.0) {
        updateSemester({ ...semester, gpa: numValue });
      }
    }
  };

  const handleCreditHoursChange = (value: string) => {
    if (value === '') {
      updateSemester({ ...semester, creditHours: 0 });
    } else {
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue) && numValue >= 0 && numValue <= 50) {
        updateSemester({ ...semester, creditHours: numValue });
      }
    }
  };

  const handleRemove = () => {
    removeSemester(semester.id);
    toast({
      title: "Semester Removed",
      description: `${semester.name} has been removed.`,
    });
  };

  return (
    <div className="flex items-start gap-3 p-4 border rounded-lg mb-3 bg-card animate-slide-in shadow-sm card-hover">
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex-shrink-0 mt-1">
        <GraduationCap className="w-5 h-5 text-green-600 dark:text-green-400" />
      </div>
      <div className="flex-1">
        <div className="text-sm font-semibold text-foreground mb-3">
          {semester.name}
        </div>
        <div className={`grid gap-3 ${showCreditHours ? 'grid-cols-2' : 'grid-cols-1'}`}>
          <div className="space-y-1.5">
            <Label htmlFor={`gpa-${semester.id}`} className="text-xs text-muted-foreground">
              GPA (0 - 5.0)
            </Label>
            <Input
              id={`gpa-${semester.id}`}
              type="number"
              step="0.01"
              min="0"
              max="5"
              placeholder="e.g., 4.25"
              value={semester.gpa}
              onChange={(e) => handleGPAChange(e.target.value)}
              className="focus-visible:ring-green-600"
            />
          </div>
          {showCreditHours && (
            <div className="space-y-1.5">
              <Label htmlFor={`credits-${semester.id}`} className="text-xs text-muted-foreground">
                Total Credit Units
              </Label>
              <Input
                id={`credits-${semester.id}`}
                type="number"
                min="0"
                max="50"
                placeholder="e.g., 18"
                value={semester.creditHours || ''}
                onChange={(e) => handleCreditHoursChange(e.target.value)}
                className="focus-visible:ring-green-600"
              />
            </div>
          )}
        </div>
      </div>
      {semesters.length > 1 && (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleRemove}
          className="text-destructive hover:bg-destructive/10 flex-shrink-0 mt-1"
          aria-label={`Remove ${semester.name}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

const SemesterGPAForm = () => {
  const { state, addSemester, resetSemesters, setGPACalculationMethod } = useCGPA();
  const { toast } = useToast();
  const semesters = state.semesters || [];
  const gpaCalculationMethod = state.gpaCalculationMethod || 'simple';
  const isWeighted = gpaCalculationMethod === 'weighted';

  // Initialize with one semester if empty
  useEffect(() => {
    if (semesters.length === 0) {
      addSemester({
        id: Date.now().toString(),
        name: 'Semester 1',
        gpa: '',
        creditHours: 0,
      });
    }
  }, []);

  const handleAddSemester = () => {
    const semesterNumber = semesters.length + 1;
    const newSemester: Semester = {
      id: Date.now().toString(),
      name: `Semester ${semesterNumber}`,
      gpa: '',
      creditHours: 0,
    };
    addSemester(newSemester);
    toast({
      title: "Semester Added",
      description: `Semester ${semesterNumber} has been added.`,
    });
  };

  const handleResetAll = () => {
    if (semesters.length <= 1 && semesters[0]?.gpa === '' && !semesters[0]?.creditHours) {
      toast({
        title: "Nothing to Reset",
        description: "There's no data to reset.",
      });
      return;
    }
    
    resetSemesters();
    setTimeout(() => {
      addSemester({
        id: Date.now().toString(),
        name: 'Semester 1',
        gpa: '',
        creditHours: 0,
      });
    }, 0);
    
    toast({
      title: "All Semesters Reset",
      description: "All semester data has been cleared.",
      variant: "destructive"
    });
  };

  const handleMethodToggle = (checked: boolean) => {
    const method: GPACalculationMethod = checked ? 'weighted' : 'simple';
    setGPACalculationMethod(method);
    toast({
      title: `Calculation Method Changed`,
      description: checked 
        ? "Using weighted average (considers credit units)" 
        : "Using simple average (equal weight per semester)",
    });
  };

  return (
    <Card className="w-full animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">Enter Semester GPAs</CardTitle>
            <CardDescription className="mt-1">
              {isWeighted 
                ? "Input your GPA and credit units for each semester"
                : "Input your GPA for each semester"
              }
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleResetAll}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
            aria-label="Reset all semesters"
          >
            Reset All
          </Button>
        </div>
        
        {/* Calculation Method Toggle */}
        <div className="flex items-center justify-between mt-4 p-3 bg-muted/50 rounded-lg">
          <div className="space-y-0.5">
            <Label htmlFor="weighted-toggle" className="text-sm font-medium">
              Weighted Average
            </Label>
            <p className="text-xs text-muted-foreground">
              {isWeighted 
                ? "CGPA considers credit units per semester"
                : "CGPA is simple average of all GPAs"
              }
            </p>
          </div>
          <Switch
            id="weighted-toggle"
            checked={isWeighted}
            onCheckedChange={handleMethodToggle}
            className="data-[state=checked]:bg-green-600"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="overflow-y-auto max-h-[300px] pr-1">
            {semesters.map((semester) => (
              <SemesterItem 
                key={semester.id} 
                semester={semester} 
                showCreditHours={isWeighted}
              />
            ))}
          </div>

          <Button 
            onClick={handleAddSemester} 
            variant="outline"
            className="w-full border-dashed border-2 hover:bg-green-50 hover:text-green-700 hover:border-green-300 dark:hover:bg-green-950/30 dark:hover:text-green-400 dark:hover:border-green-800"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Semester
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SemesterGPAForm;