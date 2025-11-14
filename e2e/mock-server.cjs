// Simple mock server for e2e tests
const http = require('http');
const { parse } = require('url');

// Sample server list XML response
const mockServerListResponse = `<?xml version="1.0" encoding="UTF-8"?>
<result>
  <server>
    <name>Test Server 1</name>
    <address>127.0.0.1</address>
    <port>1234</port>
    <map_id>map1</map_id>
    <map_name>Test Map 1</map_name>
    <bots>5</bots>
    <country>US</country>
    <current_players>10</current_players>
    <timeStamp>1234567890</timeStamp>
    <version>1</version>
    <dedicated>1</dedicated>
    <mod>0</mod>
    <player>Player1</player>
    <player>Player2</player>
    <comment>Test server comment</comment>
    <url>http://example.com</url>
    <max_players>32</max_players>
    <mode>Test Mode</mode>
    <realm>test</realm>
  </server>
  <server>
    <name>Test Server 2</name>
    <address>127.0.0.2</address>
    <port>5678</port>
    <map_id>map2</map_id>
    <map_name>Test Map 2</map_name>
    <bots>0</bots>
    <country>UK</country>
    <current_players>5</current_players>
    <timeStamp>1234567891</timeStamp>
    <version>1</version>
    <dedicated>1</dedicated>
    <mod>1</mod>
    <player>Player3</player>
    <comment>Another test server</comment>
    <url>http://example2.com</url>
    <max_players>16</max_players>
    <mode>Another Mode</mode>
    <realm>test</realm>
  </server>
</result>`;

// Create a simple HTTP server
function startMockServer(port = 5800) {
	const server = http.createServer((req, res) => {
		const parsedUrl = parse(req.url || '', true);
		const pathname = parsedUrl.pathname;

		console.log(`[Mock Server] Received request: ${req.method} ${pathname}`);

		// Handle server_list endpoint
		if (pathname === '/api/server_list') {
			res.setHeader('Content-Type', 'application/xml');
			res.writeHead(200);
			res.end(mockServerListResponse);
			return;
		}

		// Default response for unhandled routes
		res.writeHead(404);
		res.end('Not Found');
	});

	return new Promise((resolve) => {
		server.listen(port, () => {
			console.log(`[Mock Server] Server running at http://localhost:${port}`);
			resolve(server);
		});
	});
}

// Start the server if this file is run directly
if (require.main === module) {
	startMockServer().catch(console.error);
}

module.exports = { startMockServer };
