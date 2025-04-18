export const parsePageNumbers = (xmlString: string): number[] => {
  // Get all the page numbers in the text, each page is like <page_x> in the text

  // Regular expression to match page tags and capture the numbers
  const pageRegex = /<page_(\d+)>/g;

  // Find all matches
  const matches = [...xmlString.matchAll(pageRegex)];

  // Extract and convert the captured numbers to integers
  const pageNumbers = matches.map((match) => parseInt(match[1], 10));

  // Sort the numbers in ascending order
  return pageNumbers.sort((a, b) => a - b);
};
