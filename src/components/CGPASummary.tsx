import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCGPA } from '@/context/CGPAContext';
import { useToast } from '@/components/ui/use-toast';
import { Download } from 'lucide-react';
import { generatePDF } from '@/utils/exportUtils';

const CGPASummary = () => {
  const { calculateCGPA, calculateCGPAByGPA, state } = useCGPA();
  const { toast } = useToast();
  
  const courses = state.courses || [];
  const semesters = state.semesters || [];
  const calculationMode = state.calculationMode || 'subjects';
  const gpaCalculationMethod = state.gpaCalculationMethod || 'simple';

  const subjectResult = calculateCGPA();
  const gpaResult = calculateCGPAByGPA();

  const cgpa = calculationMode === 'subjects' ? subjectResult.cgpa : gpaResult.cgpa;

  const getCGPAClass = (cgpaValue: number): string => {
    if (cgpaValue >= 4.5) return 'First Class';
    if (cgpaValue >= 3.5) return 'Second Class Upper';
    if (cgpaValue >= 2.5) return 'Second Class Lower';
    if (cgpaValue >= 1.5) return 'Third Class';
    if (cgpaValue > 0) return 'Pass';
    return 'N/A';
  };

  const handleExportPDF = () => {
    if (calculationMode === 'subjects') {
      if (courses.length === 0) {
        toast({
          title: "No Data to Export",
          description: "Please add some courses before exporting.",
        });
        return;
      }
      generatePDF(courses, { 
        totalCredits: subjectResult.totalCredits, 
        totalPoints: subjectResult.totalPoints, 
        cgpa: subjectResult.cgpa 
      });
    } else {
      const validSemesters = semesters.filter(s => s.gpa !== '');
      if (validSemesters.length === 0) {
        toast({
          title: "No Data to Export",
          description: "Please add some semester GPAs before exporting.",
        });
        return;
      }
    }
    
    toast({
      title: "PDF Generated",
      description: "Your CGPA report has been downloaded.",
    });
  };

  const getMethodDescription = () => {
    if (calculationMode === 'subjects') {
      return 'CGPA = Total Grade Points / Total Credit Units';
    }
    return gpaCalculationMethod === 'weighted'
      ? 'CGPA = Weighted Average (by Credit Units)'
      : 'CGPA = Simple Average of Semester GPAs';
  };

  return (
    <Card className="w-full animate-fade-in">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">CGPA Summary</CardTitle>
        <CardDescription>{getMethodDescription()}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {calculationMode === 'subjects' ? (
              <>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground">Total Credits</div>
                  <div className="text-2xl font-bold">{subjectResult.totalCredits}</div>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground">Total Points</div>
                  <div className="text-2xl font-bold">{subjectResult.totalPoints}</div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground">Semesters</div>
                  <div className="text-2xl font-bold">{gpaResult.totalSemesters}</div>
                </div>
                {gpaCalculationMethod === 'weighted' && (
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground">Total Credit Units</div>
                    <div className="text-2xl font-bold">{gpaResult.totalCreditHours}</div>
                  </div>
                )}
                {gpaCalculationMethod === 'simple' && (
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground">Method</div>
                    <div className="text-lg font-bold">Simple Avg</div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="bg-green-50 dark:bg-green-950/30 p-6 rounded-lg text-center">
            <div className="text-sm text-green-700 dark:text-green-400 mb-1">Your CGPA</div>
            <div className="text-4xl font-bold text-green-700 dark:text-green-400">{cgpa}</div>
            <div className="text-xs text-green-600 dark:text-green-500 mt-1">out of 5.0</div>
            <div className="text-sm mt-2 font-medium text-green-700 dark:text-green-400">
              {getCGPAClass(cgpa)}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-end">
        <Button 
          onClick={handleExportPDF} 
          variant="outline" 
          className="flex items-center gap-2 hover:bg-green-50 hover:text-green-700 hover:border-green-300 dark:hover:bg-green-950/30 dark:hover:text-green-400 dark:hover:border-green-800"
        >
          <Download className="w-4 h-4" />
          Export as PDF
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CGPASummary;