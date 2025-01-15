import jsPDF from 'jspdf';
import { unparse } from 'papaparse';
import autoTable from 'jspdf-autotable';

interface AnalyticsData {
  timeSpentData: { date: string; value: number }[];
  completionRateData: { date: string; value: number }[];
  subjectDistribution: { subject: string; count: number }[];
  learningStyles: { style: string; percentage: number }[];
  difficultyLevels: { level: string; count: number }[];
  interactionMetrics: {
    avgTimePerLesson: number;
    avgAttemptsPerExercise: number;
    completionRate: number;
    accuracyRate: number;
  };
  progressTrends: {
    daily: { date: string; progress: number }[];
    weekly: { date: string; progress: number }[];
    monthly: { date: string; progress: number }[];
  };
}

export function exportToPDF(data: AnalyticsData, userName: string) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  let yOffset = 20;

  // Title
  doc.setFontSize(20);
  doc.text('Learning Analytics Report', pageWidth / 2, yOffset, { align: 'center' });
  yOffset += 15;

  // User Info
  doc.setFontSize(12);
  doc.text(`Student: ${userName}`, 20, yOffset);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - 20, yOffset, { align: 'right' });
  yOffset += 20;

  // Key Metrics
  doc.setFontSize(14);
  doc.text('Key Performance Metrics', 20, yOffset);
  yOffset += 10;

  const metrics = [
    ['Average Time per Lesson', `${Math.round(data.interactionMetrics.avgTimePerLesson)} min`],
    ['Average Attempts per Exercise', data.interactionMetrics.avgAttemptsPerExercise.toFixed(1)],
    ['Completion Rate', `${Math.round(data.interactionMetrics.completionRate)}%`],
    ['Accuracy Rate', `${Math.round(data.interactionMetrics.accuracyRate)}%`],
  ];

  autoTable(doc, {
    startY: yOffset,
    head: [['Metric', 'Value']],
    body: metrics,
    theme: 'striped',
  });

  yOffset = (doc as any).lastAutoTable.finalY + 20;

  // Learning Styles Distribution
  doc.text('Learning Style Distribution', 20, yOffset);
  yOffset += 10;

  const learningStylesData = data.learningStyles.map(style => [
    style.style,
    `${style.percentage}%`,
  ]);

  autoTable(doc, {
    startY: yOffset,
    head: [['Learning Style', 'Percentage']],
    body: learningStylesData,
    theme: 'striped',
  });

  yOffset = (doc as any).lastAutoTable.finalY + 20;

  // Subject Distribution
  doc.text('Subject Distribution', 20, yOffset);
  yOffset += 10;

  const subjectData = data.subjectDistribution.map(subject => [
    subject.subject,
    subject.count.toString(),
  ]);

  autoTable(doc, {
    startY: yOffset,
    head: [['Subject', 'Count']],
    body: subjectData,
    theme: 'striped',
  });

  // Add new page for progress trends
  doc.addPage();
  yOffset = 20;

  doc.text('Progress Trends', 20, yOffset);
  yOffset += 10;

  const progressData = data.progressTrends.monthly.map(item => [
    item.date,
    `${item.progress}%`,
  ]);

  autoTable(doc, {
    startY: yOffset,
    head: [['Date', 'Progress']],
    body: progressData,
    theme: 'striped',
  });

  // Save the PDF
  doc.save(`learning-analytics-${userName.toLowerCase().replace(/\s+/g, '-')}.pdf`);
}

export function exportToCSV(data: AnalyticsData, userName: string) {
  // Prepare data for CSV export
  const csvData = {
    'Key Metrics': [
      {
        Metric: 'Average Time per Lesson',
        Value: `${Math.round(data.interactionMetrics.avgTimePerLesson)} min`,
      },
      {
        Metric: 'Average Attempts per Exercise',
        Value: data.interactionMetrics.avgAttemptsPerExercise.toFixed(1),
      },
      {
        Metric: 'Completion Rate',
        Value: `${Math.round(data.interactionMetrics.completionRate)}%`,
      },
      {
        Metric: 'Accuracy Rate',
        Value: `${Math.round(data.interactionMetrics.accuracyRate)}%`,
      },
    ],
    'Learning Styles': data.learningStyles.map(style => ({
      Style: style.style,
      Percentage: `${style.percentage}%`,
    })),
    'Subject Distribution': data.subjectDistribution.map(subject => ({
      Subject: subject.subject,
      Count: subject.count,
    })),
    'Time Spent': data.timeSpentData.map(item => ({
      Date: item.date,
      'Hours Spent': item.value,
    })),
    'Completion Rates': data.completionRateData.map(item => ({
      Date: item.date,
      'Completion Rate': `${item.value}%`,
    })),
    'Monthly Progress': data.progressTrends.monthly.map(item => ({
      Date: item.date,
      Progress: `${item.progress}%`,
    })),
  };

  // Convert each section to CSV and combine
  const sections = Object.entries(csvData).map(([title, sectionData]) => {
    const csv = unparse(sectionData);
    return `${title}\n${csv}\n\n`;
  });

  // Create blob and download
  const blob = new Blob([sections.join('')], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `learning-analytics-${userName.toLowerCase().replace(/\s+/g, '-')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
