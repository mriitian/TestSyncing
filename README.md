# TestSyncing
# Real-Time Meal Records Sync

This project simulates real-time syncing of meal records across tablets using a server as a mediator. The tablets and server are represented by separate objects in the code.

## Overview

The project consists of two main classes:

1. **Device Class**
   - Represents a tablet.
   - Generates dummy but unique meal records and sends updates to the server.
   - Can probe the server to receive updates based on aggregated data from all tablets.

2. **SyncService Class**
   - Represents the server that mediates the syncing process.
   - Handles messages received from devices.
   - Responds to `probe` messages by sending the desired information in the correct format (`update`).
   - No return value required for handling `record` messages.

## Getting Started

Follow the steps below to run the project on your local machine.

### Prerequisites

- Node.js installed
- npm (Node Package Manager) installed

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
