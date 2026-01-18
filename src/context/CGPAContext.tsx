import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';

export type Grade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface Course {
  id: string;
  name: string;
  creditUnits: number;
  grade: Grade;
}

export interface Semester {
  id: string;
  name: string;
  gpa: number | '';
  creditHours: number;
}

export const gradePoints: Record<Grade, number> = {
  'A': 5,
  'B': 4,
  'C': 3,
  'D': 2,
  'F': 0,
};

export type CalculationMode = 'subjects' | 'gpa';
export type GPACalculationMethod = 'weighted' | 'simple';

interface CGPAState {
  courses: Course[];
  semesters: Semester[];
  calculationMode: CalculationMode;
  gpaCalculationMethod: GPACalculationMethod;
  darkMode: boolean;
}

type CGPAAction =
  | { type: 'ADD_COURSE'; payload: Course }
  | { type: 'REMOVE_COURSE'; payload: string }
  | { type: 'UPDATE_COURSE'; payload: Course }
  | { type: 'RESET_ALL' }
  | { type: 'SET_CALCULATION_MODE'; payload: CalculationMode }
  | { type: 'SET_GPA_CALCULATION_METHOD'; payload: GPACalculationMethod }
  | { type: 'ADD_SEMESTER'; payload: Semester }
  | { type: 'UPDATE_SEMESTER'; payload: Semester }
  | { type: 'REMOVE_SEMESTER'; payload: string }
  | { type: 'RESET_SEMESTERS' }
  | { type: 'TOGGLE_DARK_MODE' };

const initialState: CGPAState = {
  courses: [],
  semesters: [],
  calculationMode: 'subjects',
  gpaCalculationMethod: 'simple',
  darkMode: false,
};

const cgpaReducer = (state: CGPAState, action: CGPAAction): CGPAState => {
  switch (action.type) {
    case 'ADD_COURSE':
      return { ...state, courses: [...state.courses, action.payload] };
    case 'REMOVE_COURSE':
      return { ...state, courses: state.courses.filter(course => course.id !== action.payload) };
    case 'UPDATE_COURSE':
      return {
        ...state,
        courses: state.courses.map(course =>
          course.id === action.payload.id ? action.payload : course
        ),
      };
    case 'RESET_ALL':
      return { ...state, courses: [] };
    case 'SET_CALCULATION_MODE':
      return { ...state, calculationMode: action.payload };
    case 'SET_GPA_CALCULATION_METHOD':
      return { ...state, gpaCalculationMethod: action.payload };
    case 'ADD_SEMESTER':
      return { ...state, semesters: [...(state.semesters || []), action.payload] };
    case 'UPDATE_SEMESTER':
      return {
        ...state,
        semesters: (state.semesters || []).map(semester =>
          semester.id === action.payload.id ? action.payload : semester
        ),
      };
    case 'REMOVE_SEMESTER':
      return { ...state, semesters: (state.semesters || []).filter(semester => semester.id !== action.payload) };
    case 'RESET_SEMESTERS':
      return { ...state, semesters: [] };
    case 'TOGGLE_DARK_MODE':
      return { ...state, darkMode: !state.darkMode };
    default:
      return state;
  }
};

const loadStateFromStorage = (): CGPAState => {
  if (typeof window !== 'undefined') {
    const savedState = localStorage.getItem('cgpaState');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        return {
          courses: parsed.courses || [],
          semesters: parsed.semesters || [],
          calculationMode: parsed.calculationMode || 'subjects',
          gpaCalculationMethod: parsed.gpaCalculationMethod || 'simple',
          darkMode: parsed.darkMode ?? false,
        };
      } catch {
        return initialState;
      }
    }
  }
  return initialState;
};

interface CGPAContextType {
  state: CGPAState;
  addCourse: (course: Course) => void;
  removeCourse: (id: string) => void;
  updateCourse: (course: Course) => void;
  resetAll: () => void;
  calculateCGPA: () => { totalCredits: number; totalPoints: number; cgpa: number };
  setCalculationMode: (mode: CalculationMode) => void;
  setGPACalculationMethod: (method: GPACalculationMethod) => void;
  addSemester: (semester: Semester) => void;
  updateSemester: (semester: Semester) => void;
  removeSemester: (id: string) => void;
  resetSemesters: () => void;
  calculateCGPAByGPA: () => { totalSemesters: number; totalCreditHours: number; cgpa: number };
  toggleDarkMode: () => void;
}

const CGPAContext = createContext<CGPAContextType | undefined>(undefined);

export const CGPAProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cgpaReducer, initialState, loadStateFromStorage);

  useEffect(() => {
    localStorage.setItem('cgpaState', JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (state.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.darkMode]);

  const addCourse = (course: Course) => {
    dispatch({ type: 'ADD_COURSE', payload: course });
  };

  const removeCourse = (id: string) => {
    dispatch({ type: 'REMOVE_COURSE', payload: id });
  };

  const updateCourse = (course: Course) => {
    dispatch({ type: 'UPDATE_COURSE', payload: course });
  };

  const resetAll = () => {
    dispatch({ type: 'RESET_ALL' });
  };

  const setCalculationMode = (mode: CalculationMode) => {
    dispatch({ type: 'SET_CALCULATION_MODE', payload: mode });
  };

  const setGPACalculationMethod = (method: GPACalculationMethod) => {
    dispatch({ type: 'SET_GPA_CALCULATION_METHOD', payload: method });
  };

  const addSemester = (semester: Semester) => {
    dispatch({ type: 'ADD_SEMESTER', payload: semester });
  };

  const updateSemester = (semester: Semester) => {
    dispatch({ type: 'UPDATE_SEMESTER', payload: semester });
  };

  const removeSemester = (id: string) => {
    dispatch({ type: 'REMOVE_SEMESTER', payload: id });
  };

  const resetSemesters = () => {
    dispatch({ type: 'RESET_SEMESTERS' });
  };

  const calculateCGPA = () => {
    const courses = state.courses || [];
    const totalCredits = courses.reduce((sum, course) => sum + course.creditUnits, 0);
    const totalPoints = courses.reduce(
      (sum, course) => sum + gradePoints[course.grade] * course.creditUnits,
      0
    );
    const cgpa = totalCredits > 0 ? Number((totalPoints / totalCredits).toFixed(2)) : 0;
    return { totalCredits, totalPoints, cgpa };
  };

  const calculateCGPAByGPA = () => {
    const semesters = state.semesters || [];
    const gpaCalculationMethod = state.gpaCalculationMethod || 'simple';
    
    const validSemesters = semesters.filter(s => s.gpa !== '' && typeof s.gpa === 'number');
    const totalSemesters = validSemesters.length;
    
    if (totalSemesters === 0) {
      return { totalSemesters: 0, totalCreditHours: 0, cgpa: 0 };
    }

    let cgpa: number;
    let totalCreditHours: number;

    if (gpaCalculationMethod === 'weighted') {
      // Weighted Average: (GPA1 × Credits1 + GPA2 × Credits2) / (Credits1 + Credits2)
      const semestersWithCredits = validSemesters.filter(s => s.creditHours > 0);
      
      if (semestersWithCredits.length === 0) {
        return { totalSemesters: 0, totalCreditHours: 0, cgpa: 0 };
      }

      totalCreditHours = semestersWithCredits.reduce((sum, s) => sum + s.creditHours, 0);
      const weightedSum = semestersWithCredits.reduce(
        (sum, s) => sum + (s.gpa as number) * s.creditHours, 
        0
      );
      
      cgpa = totalCreditHours > 0 
        ? Number((weightedSum / totalCreditHours).toFixed(2)) 
        : 0;
    } else {
      // Simple Average: (GPA1 + GPA2 + GPA3) / Number of Semesters
      totalCreditHours = validSemesters.reduce((sum, s) => sum + (s.creditHours || 0), 0);
      const totalGPA = validSemesters.reduce((sum, s) => sum + (s.gpa as number), 0);
      cgpa = Number((totalGPA / totalSemesters).toFixed(2));
    }

    return { totalSemesters, totalCreditHours, cgpa };
  };

  const toggleDarkMode = () => {
    dispatch({ type: 'TOGGLE_DARK_MODE' });
  };

  return (
    <CGPAContext.Provider
      value={{
        state,
        addCourse,
        removeCourse,
        updateCourse,
        resetAll,
        calculateCGPA,
        setCalculationMode,
        setGPACalculationMethod,
        addSemester,
        updateSemester,
        removeSemester,
        resetSemesters,
        calculateCGPAByGPA,
        toggleDarkMode,
      }}
    >
      {children}
    </CGPAContext.Provider>
  );
};

export const useCGPA = () => {
  const context = useContext(CGPAContext);
  if (!context) {
    throw new Error('useCGPA must be used within a CGPAProvider');
  }
  return context;
};