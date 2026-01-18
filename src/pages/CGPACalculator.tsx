import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CourseForm from '@/components/CourseForm';
import CourseList from '@/components/CourseList';
import CGPASummary from '@/components/CGPASummary';
import SemesterGPAForm from '@/components/SemesterGpaForm';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCGPA, CalculationMode } from '@/context/CGPAContext';
import { BookOpen, Calculator } from 'lucide-react';

const CGPACalculator = () => {
  const { state, setCalculationMode } = useCGPA();
  const { calculationMode } = state;

  const handleTabChange = (value: string) => {
    setCalculationMode(value as CalculationMode);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-6 flex-grow">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-2">CGPA Calculator</h1>
          <p className="text-center text-muted-foreground mb-6">
            Track your academic performance and calculate your Cumulative Grade Point Average
          </p>
          
          {/* Tabs for switching calculation modes */}
          <Tabs 
            value={calculationMode} 
            onValueChange={handleTabChange} 
            className="w-full mb-6"
          >
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-6">
              <TabsTrigger 
                value="subjects" 
                className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white"
              >
                <BookOpen className="w-4 h-4" />
                Calculate by Subjects
              </TabsTrigger>
              <TabsTrigger 
                value="gpa" 
                className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white"
              >
                <Calculator className="w-4 h-4" />
                Calculate by GPA
              </TabsTrigger>
            </TabsList>

            {/* Calculate by Subjects Tab */}
            <TabsContent value="subjects" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <ErrorBoundary>
                  <CourseForm />
                </ErrorBoundary>
                <ErrorBoundary>
                  <CGPASummary />
                </ErrorBoundary>
              </div>
              
              <ErrorBoundary>
                <CourseList />
              </ErrorBoundary>
            </TabsContent>

            {/* Calculate by GPA Tab */}
            <TabsContent value="gpa" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ErrorBoundary>
                  <SemesterGPAForm />
                </ErrorBoundary>
                <ErrorBoundary>
                  <CGPASummary />
                </ErrorBoundary>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CGPACalculator;