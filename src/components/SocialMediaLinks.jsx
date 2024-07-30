import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SocialMediaLinks = ({ onUpdate }) => {
  const [links, setLinks] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSocialMediaLinks();
  }, []);

  const fetchSocialMediaLinks = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement actual API call to fetch and consolidate social media links
      const fetchedLinks = {
        twitter: 'https://twitter.com/username',
        instagram: 'https://instagram.com/username',
        facebook: 'https://facebook.com/username',
        // Add more social media platforms as needed
      };
      setLinks(fetchedLinks);
      onUpdate(formatSocialMediaDescription(fetchedLinks));
    } catch (error) {
      console.error('Error fetching social media links:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyAndUpdateLink = async (platform, url) => {
    // TODO: Implement actual link verification and correction logic
    console.log(`Verifying ${platform} link: ${url}`);
    return url; // Return corrected URL if needed
  };

  const handleLinkChange = async (platform, newUrl) => {
    const verifiedUrl = await verifyAndUpdateLink(platform, newUrl);
    setLinks(prevLinks => ({
      ...prevLinks,
      [platform]: verifiedUrl
    }));
    onUpdate(formatSocialMediaDescription({ ...links, [platform]: verifiedUrl }));
  };

  const formatSocialMediaDescription = (links) => {
    return Object.entries(links)
      .map(([platform, url]) => `${platform.charAt(0).toUpperCase() + platform.slice(1)}: ${url}`)
      .join('\n');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Social Media Links</CardTitle>
        <CardDescription>Manage your social media links for video descriptions.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Loading social media links...</p>
        ) : (
          <>
            {Object.entries(links).map(([platform, url]) => (
              <div key={platform} className="mb-4">
                <Label htmlFor={`${platform}-link`}>{platform.charAt(0).toUpperCase() + platform.slice(1)}</Label>
                <Input
                  id={`${platform}-link`}
                  value={url}
                  onChange={(e) => handleLinkChange(platform, e.target.value)}
                  className="mt-1"
                />
              </div>
            ))}
            <Button onClick={fetchSocialMediaLinks}>Refresh Links</Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SocialMediaLinks;
