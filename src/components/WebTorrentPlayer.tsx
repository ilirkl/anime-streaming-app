'use client';

'use client';

import React, { useEffect, useRef, useState } from 'react';
// No direct import of webtorrent or its types needed here anymore

// Declare window interface augmentation for WebTorrent global
declare global {
    interface Window {
        WebTorrent: any; // Use 'any' or define a more specific type if needed
    }
}

interface WebTorrentPlayerProps {
  torrentId: string; // Magnet link
}

const WebTorrentPlayer: React.FC<WebTorrentPlayerProps> = ({ torrentId }) => {
  const logRef = useRef<HTMLDivElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null); // Ref for the video container
  // State to indicate if the script has loaded and the constructor is available
  const [isWebTorrentReady, setIsWebTorrentReady] = useState(false);
  const clientRef = useRef<any | null>(null); // Ref to hold the client instance (use 'any' as type is global)

  const log = (str: string) => {
    if (logRef.current) {
      const p = document.createElement('p');
      p.innerHTML = str;
      // Prepend new logs instead of appending for easier viewing
      logRef.current.insertBefore(p, logRef.current.firstChild);
    }
  };

  // Effect to load the WebTorrent library script from CDN
  useEffect(() => {
    // Check if the script is already loaded (e.g., by another instance or previous navigation)
    if (window.WebTorrent) {
      console.log('WebTorrent global already exists.');
      setIsWebTorrentReady(true);
      return;
    }

    console.log('Loading WebTorrent script from CDN...');
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/webtorrent@latest/webtorrent.min.js';
    script.async = true;

    script.onload = () => {
      console.log('WebTorrent script loaded successfully from CDN.');
      setIsWebTorrentReady(true);
    };

    script.onerror = (error) => {
      console.error('Failed to load WebTorrent script:', error);
      log('Error: Failed to load WebTorrent script from CDN.');
      setIsWebTorrentReady(false); // Ensure state reflects failure
    };

    document.body.appendChild(script);

    // Cleanup function: remove the script if the component unmounts before loading
    return () => {
      const existingScript = document.querySelector(`script[src="${script.src}"]`);
      if (existingScript && !window.WebTorrent) { // Only remove if it didn't load successfully
        console.log('Cleaning up WebTorrent script tag.');
        document.body.removeChild(existingScript);
      }
    };
  }, []); // Run only once on mount

  // Effect to handle torrent logic once the library is ready
  useEffect(() => {
    // Wait until WebTorrent is ready via script load and torrentId is available
    if (!isWebTorrentReady || !torrentId) {
      if (!torrentId && logRef.current) {
          logRef.current.innerHTML = '<p>Error: No torrent ID provided.</p>';
      } else if (!isWebTorrentReady && logRef.current && !logRef.current.innerHTML.includes('Loading WebTorrent script...')) {
          logRef.current.innerHTML = '<p>Loading WebTorrent script...</p>';
      }
      return; // Exit if library or torrentId is not ready
    }

    // --- Client Creation and Torrent Handling ---
    log('Attempting to initialize WebTorrent client...');
    // Clear previous logs and player content *before* creating new client
    if (logRef.current) logRef.current.innerHTML = '';
    if (playerContainerRef.current) playerContainerRef.current.innerHTML = '<p>Initializing player...</p>'; // Placeholder

    let currentClient: any = null; // Use 'any' since type comes from global

    try {
      // Instantiate client using the global constructor
      currentClient = new window.WebTorrent();
      clientRef.current = currentClient; // Store client instance in ref for cleanup
      log(`WebTorrent client created for: ${torrentId}`);

      currentClient.on('error', (err: Error | string) => {
        const message = typeof err === 'string' ? err : err.message;
        console.error('WebTorrent Client ERROR:', message);
        log(`CLIENT ERROR: ${message}`);
      });

      log('Adding torrent...');
      currentClient.add(torrentId, (torrent: any) => { // Use 'any' for torrent object from global
        log('Got torrent metadata!');
        log(
          `Torrent info hash: ${torrent.infoHash} ` +
          `<a href="${torrent.magnetURI}" target="_blank">[Magnet URI]</a> ` +
          `<a href="${torrent.torrentFileBlobURL}" target="_blank" download="${torrent.name}.torrent">[Download .torrent]</a>`
        );

        // Use 'any' for file objects from global
        const videoFile = torrent.files.reduce((largest: any | null, file: any) => {
          const isVideo = /\.(mp4|mkv|webm|avi|mov)$/i.test(file.name);
          if (isVideo && (!largest || file.length > largest.length)) {
            return file;
          }
          return largest;
        }, null);

        if (videoFile) {
          log(`Found video file: ${videoFile.name}. Appending to player...`);
          if (playerContainerRef.current) {
            playerContainerRef.current.innerHTML = ''; // Clear placeholder
            // appendTo callback signature might differ slightly with global script, adjust if needed
            videoFile.appendTo(playerContainerRef.current, (err?: Error, elem?: HTMLMediaElement) => {
              if (err) {
                log(`Error appending video: ${err.message}`);
                console.error('Error appending video:', err);
              } else {
                log('Video player appended successfully.');
                if (elem && elem instanceof HTMLVideoElement) {
                  elem.controls = true;
                  elem.style.width = '100%';
                }
              }
            });
          } else {
              log('Error: Player container not found.');
          }
        } else {
          log('No suitable video file found in the torrent.');
          log('Files in torrent:');
          torrent.files.forEach((file: any) => log(`- ${file.name} (${file.length} bytes)`)); // Use 'any' for file
        }

        const interval = setInterval(() => {
          // Add null check for currentClient before accessing properties
          const downloadSpeed = currentClient ? (currentClient.downloadSpeed / 1024 / 1024).toFixed(2) : 'N/A';
          log(`Progress: ${(torrent.progress * 100).toFixed(1)}% | DL Speed: ${downloadSpeed} MB/s | Peers: ${torrent.numPeers}`);
        }, 5000);

        torrent.on('done', () => {
          log('Progress: 100% - Torrent download finished!');
          clearInterval(interval);
        });

        torrent.on('error', (err: Error | string) => {
            const message = typeof err === 'string' ? err : err.message;
            console.error('Torrent ERROR:', message);
            log(`TORRENT ERROR: ${message}`);
        });

        // Log all files and provide blob URLs (useful for debugging)
        torrent.files.forEach(function (file: any) { // Use 'any' for file
          log(`File found: ${file.name}`);
          // getBlobURL callback signature might differ slightly with global script, adjust if needed
          file.getBlobURL(function (err?: string | Error, blobURL?: string) {
            if (err) {
                const message = typeof err === 'string' ? err : err.message;
                return log(`Blob URL Error for ${file.name}: ${message}`);
            }
            if (blobURL) { // Check if blobURL exists
              log(` > <a href="${blobURL}" target="_blank">Download ${file.name} (Blob URL)</a>`);
            }
          });
        });
      });

    } catch (error: any) {
      console.error("Error creating WebTorrent client:", error);
      log(`Error creating WebTorrent client: ${error.message}`);
      // Ensure cleanup if client creation fails mid-way
      if (currentClient) {
          currentClient.destroy();
          clientRef.current = null;
      }
      return; // Stop execution
    }

    // --- Cleanup for this effect instance ---
    return () => {
      log(`Cleaning up client for torrent: ${torrentId}`);
      if (currentClient) {
        currentClient.destroy((err: Error | string | null) => {
          if (err) {
            const message = typeof err === 'string' ? err : err.message;
            console.error('Error destroying WebTorrent client during cleanup:', message);
            log(`Error cleaning up client: ${message}`);
          } else {
            log('WebTorrent client destroyed successfully.');
          }
        });
        // Important: Also clear the ref if this specific client is being cleaned up
        if (clientRef.current === currentClient) {
            clientRef.current = null;
        }
      }
      // Clear logs and player on component unmount or torrentId change
      if (logRef.current) logRef.current.innerHTML = '';
      if (playerContainerRef.current) playerContainerRef.current.innerHTML = '';
    };
    // Dependency array includes the script readiness state now
  }, [torrentId, isWebTorrentReady]);

  return (
    <div>
      {/* Container where the video player will be appended */}
      <div ref={playerContainerRef} style={{ width: '100%', minHeight: '200px', backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
        {/* Show loading state until WebTorrent script is ready */}
        {!isWebTorrentReady ? <p>Loading WebTorrent script...</p> : <p>Loading player...</p>}
      </div>

      {/* Log Area */}
      <details className="mt-4">
          <summary className="cursor-pointer text-sm font-medium">Show Logs</summary>
          <div ref={logRef} className="log mt-2 p-2 border rounded bg-muted/50 text-xs" style={{ maxHeight: '200px', overflowY: 'auto', fontFamily: 'monospace' }}>
              {/* Logs will be prepended here */}
          </div>
      </details>
    </div>
  );
};

export default WebTorrentPlayer;
