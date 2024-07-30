import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const AutoScheduler = ({ videoData, onSchedule }) => {
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState('');
  const [scheduledTime, setScheduledTime] = useState(null);

  useEffect(() => {
    fetchPlaylists();
    fetchOptimalScheduleTime();
  }, []);

  const fetchPlaylists = async () => {
    // TODO: Implement actual playlist fetching from YouTube API
    const mockPlaylists = [
      { id: 'A', name: 'Playlist A', frequency: 2 },
      { id: 'B', name: 'Playlist B', frequency: 1 },
      { id: 'C', name: 'Playlist C', frequency: 3 },
    ];
    setPlaylists(mockPlaylists);
  };

  const fetchOptimalScheduleTime = async () => {
    // TODO: Implement actual optimal time calculation based on analytics
    const mockOptimalTime = new Date();
    mockOptimalTime.setDate(mockOptimalTime.getDate() + 7); // Schedule a week from now
    mockOptimalTime.setHours(15, 0, 0, 0); // Set to 3 PM
    setScheduledTime(mockOptimalTime);
  };

  const handlePlaylistSelect = (playlistId) => {
    setSelectedPlaylist(playlistId);
  };

  const handleSchedule = () => {
    if (selectedPlaylist && scheduledTime) {
      onSchedule(selectedPlaylist, scheduledTime);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Auto Scheduler</CardTitle>
        <CardDescription>Optimize your video publishing schedule</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="playlist-select">Select Playlist</Label>
          <Select onValueChange={handlePlaylistSelect}>
            <SelectTrigger id="playlist-select">
              <SelectValue placeholder="Choose a playlist" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No Playlist</SelectItem>
              {playlists.map((playlist) => (
                <SelectItem key={playlist.id} value={playlist.id}>
                  {playlist.name} ({playlist.frequency}/week)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="scheduled-time">Optimal Scheduled Time</Label>
          <Input
            id="scheduled-time"
            type="datetime-local"
            value={scheduledTime ? scheduledTime.toISOString().slice(0, 16) : ''}
            onChange={(e) => setScheduledTime(new Date(e.target.value))}
          />
        </div>
        <Button onClick={handleSchedule}>Set Schedule</Button>
      </CardContent>
    </Card>
  );
};

export default AutoScheduler;
