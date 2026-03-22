import { FormField } from '@/types/form';

export function getTypeLabel(type: number): string {
  switch (type) {
    case 0: return 'Văn bản ngắn';
    case 1: return 'Đoạn văn';
    case 2: return 'Trắc nghiệm';
    case 3: return 'Dropdown';
    case 4: return 'Checkbox';
    case 5: return 'Thang đo';
    case 7: return 'Lưới';
    case 9: return 'Ngày tháng';
    case 10: return 'Thời gian';
    case 18: return 'Đánh giá sao';
    default: return 'Văn bản';
  }
}

export interface ParseResult {
  fields: FormField[];
  pageCount: number;
}

export function parseFormHtml(htmlSource: string): ParseResult {
  const fields: FormField[] = [];

  try {
    const regex = /FB_PUBLIC_LOAD_DATA_\s*=\s*(\[[\s\S]*?\]);/;
    const match = htmlSource.match(regex);

    if (!match || match.length < 2) {
      throw new Error('Không tìm thấy dữ liệu cấu trúc Form (FB_PUBLIC_LOAD_DATA_)');
    }

    const jsonString = match[1];
    
    // Parse the Google Form data structure
    const formStructure = new Function(`return ${jsonString}`)();
    
    // Google Forms stores questions across all pages in formStructure[1][1]
    // Multi-page forms have page breaks as separate items but all questions are in the same array
    // Some forms may nest questions differently, so we also check formStructure[1] deeper
    let questionsArray = formStructure?.[1]?.[1];

    if (!questionsArray || !Array.isArray(questionsArray)) {
      // Fallback: try to find questions array in alternative structure
      const formData = formStructure?.[1];
      if (formData && Array.isArray(formData)) {
        for (const item of formData) {
          if (Array.isArray(item) && item.length > 0 && Array.isArray(item[0])) {
            questionsArray = item;
            break;
          }
        }
      }
      if (!questionsArray || !Array.isArray(questionsArray)) {
        throw new Error('Không tìm thấy mảng câu hỏi trong Form');
      }
    }

    questionsArray.forEach((q: any) => {
      if (!q || !Array.isArray(q)) return;
      
      const questionData = q[4];
      if (!questionData || !Array.isArray(questionData) || questionData.length === 0) return;

      const entryData = questionData[0];
      if (!entryData || !Array.isArray(entryData)) return;

      const entryId = entryData[0];
      if (!entryId) return;

      const name = (q[1] || 'Không có tiêu đề')
        .replace(/<[^>]*>/g, '')
        .replace(/\r?\n|\r/g, ' ')
        .trim();

      const type = q[3] || 0;
      
      // Debug log for type 7 (grid questions)
      if (type === 7) {
        console.log('Grid question data:', {
          entryId,
          name,
          entryData,
          questionData: q[4],
          fullQuestion: q
        });
        
        // For grid questions, create separate fields for each row
        if (questionData && Array.isArray(questionData) && entryData[1] && Array.isArray(entryData[1])) {
          const columns = entryData[1]
            .filter((opt: any) => opt && Array.isArray(opt) && opt[0])
            .map((opt: any) => String(opt[0]).trim());
          
          console.log('Grid columns:', columns);
          
          questionData.forEach((row: any, rowIndex: number) => {
            console.log(`Row ${rowIndex}:`, row);
            if (row && Array.isArray(row) && row[1] && Array.isArray(row[1])) {
              const rowName = row[1] || `Hàng ${rowIndex + 1}`;
              const cleanRowName = String(rowName).replace(/<[^>]*>/g, '').replace(/\r?\n|\r/g, ' ').trim();
              
              // Try to get the actual entry ID for this row
              let rowEntryId = entryId;
              if (row[0] && typeof row[0] === 'number') {
                rowEntryId = row[0];
              }
              
              console.log(`Creating field for row ${rowIndex}:`, {
                name: cleanRowName,
                entryId: `entry.${rowEntryId}`,
                columns
              });
              
              fields.push({
                entryId: `entry.${rowEntryId}`,
                name: cleanRowName,
                type: 7,
                typeLabel: 'Lưới',
                options: columns,
                scaleMin: undefined,
                scaleMax: undefined,
              });
            }
          });
        }
        return; // Skip the normal processing for grid questions
      }
      
      // Extract options for choice-based questions
      let options: string[] | undefined;
      if ([2, 3, 4].includes(type) && entryData[1] && Array.isArray(entryData[1])) {
        options = entryData[1]
          .filter((opt: any) => opt && Array.isArray(opt) && opt[0])
          .map((opt: any) => String(opt[0]).trim());
      }

      // Extract scale range for scale questions (type 5) and rating stars (type 18)
      let scaleMin: number | undefined;
      let scaleMax: number | undefined;
      if (type === 5 && entryData[1] && Array.isArray(entryData[1])) {
        scaleMin = 1;
        scaleMax = entryData[1].length || 5;
      }
      
      // Special handling for rating scale questions (type 5 but with star/radio structure)
      // and rating stars (type 18)
      if (type === 5 || type === 18) {
        // Try to find the specific section for this question in HTML
        const questionSectionRegex = new RegExp(`entry\\.${entryId}[^>]*>[\\s\\S]*?<\\/div>[\\s\\S]*?<\\/div>[\\s\\S]*?<\\/div>`, 'i');
        const questionSection = htmlSource.match(questionSectionRegex);
        const searchArea = questionSection ? questionSection[0] : htmlSource;
        
        // Look for rating scale patterns in the search area
        const ratingMatch = searchArea.match(/data-value="(\d+)"/g);
        if (ratingMatch) {
          const values = ratingMatch.map(match => parseInt(match.match(/data-value="(\d+)"/)![1]));
          const uniqueValues = [...new Set(values)].sort((a, b) => a - b);
          if (uniqueValues.length > 1) {
            scaleMin = uniqueValues[0];
            scaleMax = uniqueValues[uniqueValues.length - 1];
          }
        }
        
        // For type 18, also check the FB_PUBLIC_LOAD_DATA structure for scale values
        if (type === 18 && entryData[1] && Array.isArray(entryData[1])) {
          const scaleValues = entryData[1].filter((item: any) => 
            Array.isArray(item) && item.length > 0 && typeof item[0] === 'string'
          ).map((item: any) => parseInt(item[0]));
          
          if (scaleValues.length > 0) {
            scaleMin = Math.min(...scaleValues);
            scaleMax = Math.max(...scaleValues);
          }
        }
      }

      fields.push({
        entryId: `entry.${entryId}`,
        name,
        type,
        typeLabel: getTypeLabel(type),
        options,
        scaleMin,
        scaleMax,
      });
    });

    // Count pages: page breaks are items with type 8, plus 1 for the first page
    let pageCount = 1;
    questionsArray.forEach((q: any) => {
      if (q && Array.isArray(q) && q[3] === 8) pageCount++;
    });

    return { fields, pageCount };
  } catch (error) {
    console.error('Error parsing form HTML:', error);
    throw error;
  }
}

export function getSubmitUrl(formUrl: string): string {
  let submitUrl = formUrl.replace('/viewform', '/formResponse');
  submitUrl = submitUrl.replace('/edit', '/formResponse');
  
  try {
    const urlObj = new URL(submitUrl);
    return urlObj.origin + urlObj.pathname;
  } catch {
    return submitUrl;
  }
}
