
export const PREDICTION_GROUPS = {
  graduate_dropout: [
    {
      title: 'Student information',
      description: 'Basic demographic and personal details.',
      fields: [
        'Marital status',
        'Nacionality',
        'Gender',
        'Age at enrollment',
        'Displaced',
        'Educational special needs',
        'International',
      ],
    },
    {
      title: 'Admission information',
      description: 'Application, course and previous qualification details.',
      fields: [
        'Application mode',
        'Application order',
        'Course',
        'Daytime/evening attendance',
        'Previous qualification',
        'Previous qualification (grade)',
        'Admission grade',
      ],
    },
    {
      title: 'Financial information',
      description: 'Tuition, scholarship and financial status.',
      fields: [
        'Debtor',
        'Tuition fees up to date',
        'Scholarship holder',
      ],
    },
    {
      title: 'Academic performance',
      description: 'First-semester academic activity and results.',
      fields: [
        'Curricular units 1st sem (credited)',
        'Curricular units 1st sem (enrolled)',
        'Curricular units 1st sem (evaluations)',
        'Curricular units 1st sem (approved)',
        'Curricular units 1st sem (grade)',
        'Curricular units 1st sem (without evaluations)',
      ],
    },
    {
      title: 'Family background',
      description: 'Parents’ education and occupations.',
      fields: [
        "Mother's qualification",
        "Father's qualification",
        "Mother's occupation",
        "Father's occupation",
      ],
    },
    {
      title: 'Economic indicators',
      description: 'Macroeconomic indicators recorded in the dataset.',
      fields: [
        'Unemployment rate',
        'Inflation rate',
        'GDP',
      ],
    },
  ],

  pass_fail: [
    {
      title: 'Student information',
      description: 'Personal and family circumstances.',
      fields: [
        'school',
        'sex',
        'age',
        'address',
        'famsize',
        'Pstatus',
        'guardian',
      ],
    },
    {
      title: 'Family background',
      description: 'Parents’ education and occupations.',
      fields: [
        'Medu',
        'Fedu',
        'Mjob',
        'Fjob',
      ],
    },
    {
      title: 'Academic information',
      description: 'Study habits, previous failures and school support.',
      fields: [
        'reason',
        'traveltime',
        'studytime',
        'failures',
        'schoolsup',
        'famsup',
        'paid',
        'activities',
        'nursery',
        'higher',
      ],
    },
    {
      title: 'Lifestyle and wellbeing',
      description: 'Internet access, relationships and daily habits.',
      fields: [
        'internet',
        'romantic',
        'famrel',
        'freetime',
        'goout',
        'Dalc',
        'Walc',
        'health',
      ],
    },
    {
      title: 'Academic performance',
      description: 'Absences and first-period grade.',
      fields: [
        'absences',
        'G1',
      ],
    },
  ],
};
