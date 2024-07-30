import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const KeywordSuggestions = ({ onSuggest }) => {
  const [suggestions, setSuggestions] = useState([]);

  const generateSuggestions = async () => {
    // TODO: Implement actual keyword suggestion logic
    const newSuggestions = ["youtube", "automation", "ai", "content creation"];
    setSuggestions(newSuggestions);
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Keyword Suggestions</CardTitle>
        <CardDescription>Get AI-powered keyword suggestions for your video.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={generateSuggestions}>Generate Suggestions</Button>
        {suggestions.length > 0 && (
          <div className="mt-4">
            {suggestions.map((keyword, index) => (
              <Badge key={index} className="mr-2 mb-2 cursor-pointer" onClick={() => onSuggest(suggestions)}>
                {keyword}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KeywordSuggestions;
