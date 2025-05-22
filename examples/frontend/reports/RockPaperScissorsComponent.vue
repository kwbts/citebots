<!-- components/labs/reports/RockPaperScissorsComponent.vue -->
<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 h-full">
    <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Randomness Control Test</h3>
    
    <TextBox>
      What type of content does ChatGPT and Perplexity prefer for any given query? We borrowed the iconic "Rock, Paper, Scissors, Lizard, Spock" game to classify content. Certain queries leaned one way, where an absence of certain types may indicate opportunities for brands. 

      We used a random dice roll as a control to monitor for biases in the data and to offer statistical validation.
    </TextBox>
    
    <!-- Labels for playful nature -->
    <div class="mb-3 flex justify-between items-center">
      <div class="text-sm text-gray-500 dark:text-gray-400 flex items-center">
        <div class="w-3 h-3 rounded-full bg-indigo-200 dark:bg-indigo-900 mr-2"></div>
        <span>Rock, Paper, Scissors, Lizard, Spock</span>
      </div>
      <div class="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-medium rounded-full">
        EXPERIMENTAL
      </div>
    </div>
    
    <!-- Main game visualization -->
    <div class="flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0 md:space-x-8">
      
      <!-- Left side - Circular RPSLS Diagram -->
      <div class="w-full md:w-2/3 flex justify-center">
        <div class="relative w-full max-w-md aspect-square">
          <!-- SVG for circular diagram -->
          <svg viewBox="0 0 500 500" class="w-full h-full">
            <!-- Background circle -->
            <circle cx="250" cy="250" r="240" fill="none" stroke="#e5e7eb" stroke-width="2" class="dark:stroke-gray-700" />
            
            <!-- Lines connecting elements -->
            <!-- Rock to Scissors -->
            <line x1="250" y1="60" x2="440" y2="330" stroke="#9333ea" stroke-width="2" stroke-dasharray="5,5" />
            <!-- Rock to Lizard -->
            <line x1="250" y1="60" x2="60" y2="330" stroke="#9333ea" stroke-width="2" stroke-dasharray="5,5" />
            <!-- Paper to Rock -->
            <line x1="440" y1="170" x2="250" y2="60" stroke="#3b82f6" stroke-width="2" stroke-dasharray="5,5" />
            <!-- Paper to Spock -->
            <line x1="440" y1="170" x2="60" y2="170" stroke="#3b82f6" stroke-width="2" stroke-dasharray="5,5" />
            <!-- Scissors to Paper -->
            <line x1="440" y1="330" x2="440" y2="170" stroke="#10b981" stroke-width="2" stroke-dasharray="5,5" />
            <!-- Scissors to Lizard -->
            <line x1="440" y1="330" x2="60" y2="330" stroke="#10b981" stroke-width="2" stroke-dasharray="5,5" />
            <!-- Lizard to Paper -->
            <line x1="60" y1="330" x2="440" y2="170" stroke="#f59e0b" stroke-width="2" stroke-dasharray="5,5" />
            <!-- Lizard to Spock -->
            <line x1="60" y1="330" x2="60" y2="170" stroke="#f59e0b" stroke-width="2" stroke-dasharray="5,5" />
            <!-- Spock to Rock -->
            <line x1="60" y1="170" x2="250" y2="60" stroke="#ef4444" stroke-width="2" stroke-dasharray="5,5" />
            <!-- Spock to Scissors -->
            <line x1="60" y1="170" x2="440" y2="330" stroke="#ef4444" stroke-width="2" stroke-dasharray="5,5" />
            
            <!-- Game Elements -->
            <!-- Rock Node -->
            <circle cx="250" cy="60" r="40" :fill="getElementBgColor('Rock')" class="dark:fill-gray-800 dark:stroke-gray-200 dark:stroke-2" />
            <text x="250" y="55" text-anchor="middle" class="text-base font-medium fill-gray-700 dark:fill-gray-200">Rock</text>
            <text x="250" y="75" text-anchor="middle" class="text-xs fill-gray-600 dark:fill-gray-300">{{ rockPercentage }}%</text>
            
            <!-- Paper Node -->
            <circle cx="440" cy="170" r="40" :fill="getElementBgColor('Paper')" class="dark:fill-gray-800 dark:stroke-gray-200 dark:stroke-2" />
            <text x="440" y="165" text-anchor="middle" class="text-base font-medium fill-gray-700 dark:fill-gray-200">Paper</text>
            <text x="440" y="185" text-anchor="middle" class="text-xs fill-gray-600 dark:fill-gray-300">{{ paperPercentage }}%</text>
            
            <!-- Scissors Node -->
            <circle cx="440" cy="330" r="40" :fill="getElementBgColor('Scissors')" class="dark:fill-gray-800 dark:stroke-gray-200 dark:stroke-2" />
            <text x="440" y="325" text-anchor="middle" class="text-base font-medium fill-gray-700 dark:fill-gray-200">Scissors</text>
            <text x="440" y="345" text-anchor="middle" class="text-xs fill-gray-600 dark:fill-gray-300">{{ scissorsPercentage }}%</text>
            
            <!-- Lizard Node -->
            <circle cx="60" cy="330" r="40" :fill="getElementBgColor('Lizard')" class="dark:fill-gray-800 dark:stroke-gray-200 dark:stroke-2" />
            <text x="60" y="325" text-anchor="middle" class="text-base font-medium fill-gray-700 dark:fill-gray-200">Lizard</text>
            <text x="60" y="345" text-anchor="middle" class="text-xs fill-gray-600 dark:fill-gray-300">{{ lizardPercentage }}%</text>
            
            <!-- Spock Node -->
            <circle cx="60" cy="170" r="40" :fill="getElementBgColor('Spock')" class="dark:fill-gray-800 dark:stroke-gray-200 dark:stroke-2" />
            <text x="60" y="165" text-anchor="middle" class="text-base font-medium fill-gray-700 dark:fill-gray-200">Spock</text>
            <text x="60" y="185" text-anchor="middle" class="text-xs fill-gray-600 dark:fill-gray-300">{{ spockPercentage }}%</text>
            
            <!-- Highlight the one from the report -->
            <circle 
              :cx="getElementPosition(mostCommonChoice).x" 
              :cy="getElementPosition(mostCommonChoice).y" 
              r="45" 
              fill="none" 
              :stroke="getElementColor(mostCommonChoice)" 
              stroke-width="3" 
            />
            
            <!-- Center Text -->
            <text x="250" y="240" text-anchor="middle" class="text-lg font-bold fill-gray-800 dark:fill-gray-200">Content</text>
            <text x="250" y="265" text-anchor="middle" class="text-lg font-bold fill-gray-800 dark:fill-gray-200">Analysis</text>
          </svg>
        </div>
      </div>
      
      <!-- Right side - Statistics and explanation -->
      <div class="w-full md:w-1/3 space-y-6">
        <!-- Dice visualization -->
        <div class="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-lg p-4">
          <h4 class="font-medium text-sm text-gray-700 dark:text-gray-300 mb-3">Randomness Check</h4>
          
          <div class="flex items-center justify-center space-x-4">
            <div class="relative w-12 h-12 bg-white dark:bg-gray-700 rounded-lg shadow-md flex items-center justify-center text-xl font-bold text-gray-800 dark:text-gray-200">
              {{ dice }}
            </div>
            <div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Dice Roll</div>
              <div class="text-base font-medium text-gray-800 dark:text-gray-200">Most Common: {{ dice }}</div>
            </div>
          </div>
          
          <div class="mt-3 flex justify-between">
            <div class="text-sm text-gray-600 dark:text-gray-400">Frequency:</div>
            <div class="text-sm font-medium text-gray-800 dark:text-gray-200">{{ diceFrequency }}%</div>
          </div>
        </div>
        
        <!-- Element Distribution -->
        <div class="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-lg p-4">
          <h4 class="font-medium text-sm text-gray-700 dark:text-gray-300 mb-3">Element Distribution</h4>
          
          <div class="space-y-3">
            <!-- Rock -->
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Rock</span>
              </div>
              <span class="text-sm text-gray-600 dark:text-gray-400">{{ rockPercentage }}%</span>
            </div>
            
            <!-- Paper -->
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Paper</span>
              </div>
              <span class="text-sm text-gray-600 dark:text-gray-400">{{ paperPercentage }}%</span>
            </div>
            
            <!-- Scissors -->
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Scissors</span>
              </div>
              <span class="text-sm text-gray-600 dark:text-gray-400">{{ scissorsPercentage }}%</span>
            </div>
            
            <!-- Lizard -->
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Lizard</span>
              </div>
              <span class="text-sm text-gray-600 dark:text-gray-400">{{ lizardPercentage }}%</span>
            </div>
            
            <!-- Spock -->
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Spock</span>
              </div>
              <span class="text-sm text-gray-600 dark:text-gray-400">{{ spockPercentage }}%</span>
            </div>
          </div>
          
          <div class="mt-3 flex justify-between text-xs">
            <span class="text-gray-500 dark:text-gray-400">Total samples:</span>
            <span class="font-medium text-gray-700 dark:text-gray-300">{{ totalSamples }}</span>
          </div>
        </div>
        
        <!-- Element Definitions -->
        <div class="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-lg p-4">
          <h4 class="font-medium text-sm text-gray-700 dark:text-gray-300 mb-3">Content Classifications</h4>
          
          <div class="space-y-2 text-xs">
            <div>
              <span class="font-medium text-purple-600 dark:text-purple-400">Rock:</span>
              <span class="text-gray-600 dark:text-gray-400"> Foundational content, pillar-type content</span>
            </div>
            <div>
              <span class="font-medium text-blue-600 dark:text-blue-400">Paper:</span>
              <span class="text-gray-600 dark:text-gray-400"> Thin content that tries to cover a lot of ground</span>
            </div>
            <div>
              <span class="font-medium text-green-600 dark:text-green-400">Scissors:</span>
              <span class="text-gray-600 dark:text-gray-400"> Opinion based pieces, be it reviews, blogs, or forums</span>
            </div>
            <div>
              <span class="font-medium text-amber-600 dark:text-amber-400">Lizard:</span>
              <span class="text-gray-600 dark:text-gray-400"> Content that is time-based (best shoes in 2025)</span>
            </div>
            <div>
              <span class="font-medium text-red-600 dark:text-red-400">Spock:</span>
              <span class="text-gray-600 dark:text-gray-400"> Imaginative, speculative, clearly stands out as unique content</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import TextBox from './TextBox.vue';

const props = defineProps({
  reportData: {
    type: Object,
    required: true
  }
});

// Extract dice and RPS data from report
const processData = computed(() => {
  if (!props.reportData || !props.reportData.clients) {
    return {
      dice: 1, 
      diceFrequency: 0,
      mostCommonChoice: 'Rock',
      rpsFrequency: 0,
      totalSamples: 0,
      elementCounts: {
        Rock: 0,
        Paper: 0,
        Scissors: 0,
        Lizard: 0,
        Spock: 0
      }
    };
  }
  
  // Data for analysis
  const diceRolls = [];
  const rpsChoices = [];
  
  // Collect data from all pages
  props.reportData.clients.forEach(client => {
    if (client.query_data) {
      client.query_data.forEach(query => {
        if (query.associated_pages) {
          query.associated_pages.forEach(page => {
            // Collect dice rolls
            if (page.dice_roll !== undefined && 
                page.dice_roll !== null && 
                !isNaN(parseInt(page.dice_roll))) {
              diceRolls.push(parseInt(page.dice_roll));
            }
            
            // Collect rock paper scissors choices
            if (page.rock_paper_scissors !== undefined && 
                page.rock_paper_scissors !== null) {
              rpsChoices.push(page.rock_paper_scissors);
            }
          });
        }
      });
    }
  });
  
  // Calculate most common dice roll
  const diceCount = {};
  diceRolls.forEach(roll => {
    diceCount[roll] = (diceCount[roll] || 0) + 1;
  });
  
  let maxDiceCount = 0;
  let mostCommonDice = 1;
  Object.entries(diceCount).forEach(([dice, count]) => {
    if (count > maxDiceCount) {
      maxDiceCount = count;
      mostCommonDice = parseInt(dice);
    }
  });
  
  // Calculate dice frequency percentage
  const diceFrequency = diceRolls.length > 0 
    ? Math.round((maxDiceCount / diceRolls.length) * 100) 
    : 0;
  
  // Count occurrences of each element in the game
  const elementCounts = {
    Rock: 0,
    Paper: 0,
    Scissors: 0,
    Lizard: 0,
    Spock: 0
  };
  
  rpsChoices.forEach(choice => {
    if (elementCounts[choice] !== undefined) {
      elementCounts[choice]++;
    }
  });
  
  // Find most common RPS choice
  let maxRpsCount = 0;
  let mostCommonRps = 'Rock';
  Object.entries(elementCounts).forEach(([choice, count]) => {
    if (count > maxRpsCount) {
      maxRpsCount = count;
      mostCommonRps = choice;
    }
  });
  
  // Calculate RPS frequency percentage
  const rpsFrequency = rpsChoices.length > 0 
    ? Math.round((maxRpsCount / rpsChoices.length) * 100) 
    : 0;
  
  return {
    dice: mostCommonDice,
    diceFrequency: diceFrequency,
    mostCommonChoice: mostCommonRps,
    rpsFrequency: rpsFrequency,
    totalSamples: rpsChoices.length,
    elementCounts: elementCounts
  };
});

// Get the extracted data
const dice = computed(() => processData.value.dice);
const diceFrequency = computed(() => processData.value.diceFrequency);
const mostCommonChoice = computed(() => processData.value.mostCommonChoice);
const rpsFrequency = computed(() => processData.value.rpsFrequency);
const totalSamples = computed(() => processData.value.totalSamples);

// Calculate percentages for each element
const rockPercentage = computed(() => {
  const total = totalSamples.value;
  if (total === 0) return 0;
  return Math.round((processData.value.elementCounts.Rock / total) * 100);
});

const paperPercentage = computed(() => {
  const total = totalSamples.value;
  if (total === 0) return 0;
  return Math.round((processData.value.elementCounts.Paper / total) * 100);
});

const scissorsPercentage = computed(() => {
  const total = totalSamples.value;
  if (total === 0) return 0;
  return Math.round((processData.value.elementCounts.Scissors / total) * 100);
});

const lizardPercentage = computed(() => {
  const total = totalSamples.value;
  if (total === 0) return 0;
  return Math.round((processData.value.elementCounts.Lizard / total) * 100);
});

const spockPercentage = computed(() => {
  const total = totalSamples.value;
  if (total === 0) return 0;
  return Math.round((processData.value.elementCounts.Spock / total) * 100);
});

// Helper functions for visualization
const getElementPosition = (element) => {
  switch(element) {
    case 'Rock': return { x: 250, y: 60 };
    case 'Paper': return { x: 440, y: 170 };
    case 'Scissors': return { x: 440, y: 330 };
    case 'Lizard': return { x: 60, y: 330 };
    case 'Spock': return { x: 60, y: 170 };
    default: return { x: 250, y: 60 };
  }
};

const getElementColor = (element) => {
  switch(element) {
    case 'Rock': return '#9333ea'; // Purple
    case 'Paper': return '#3b82f6'; // Blue
    case 'Scissors': return '#10b981'; // Green
    case 'Lizard': return '#f59e0b'; // Amber
    case 'Spock': return '#ef4444'; // Red
    default: return '#9333ea';
  }
};

const getElementBgColor = (element) => {
  if (element === mostCommonChoice.value) {
    switch(element) {
      case 'Rock': return 'var(--rock-bg-color, #e9d5ff)'; // Purple light bg
      case 'Paper': return 'var(--paper-bg-color, #dbeafe)'; // Blue light bg
      case 'Scissors': return 'var(--scissors-bg-color, #d1fae5)'; // Green light bg
      case 'Lizard': return 'var(--lizard-bg-color, #fef3c7)'; // Amber light bg
      case 'Spock': return 'var(--spock-bg-color, #fee2e2)'; // Red light bg
      default: return 'var(--default-bg-color, #f3f4f6)';
    }
  }
  return 'var(--default-bg-color, #f3f4f6)'; // Default light gray
};

const getElementTextColor = (element) => {
  switch(element) {
    case 'Rock': return 'text-purple-600 dark:text-purple-400';
    case 'Paper': return 'text-blue-600 dark:text-blue-400';
    case 'Scissors': return 'text-green-600 dark:text-green-400';
    case 'Lizard': return 'text-amber-600 dark:text-amber-400';
    case 'Spock': return 'text-red-600 dark:text-red-400';
    default: return 'text-gray-800 dark:text-gray-200';
  }
};
</script>

<style scoped>
:root {
  --rock-bg-color: #e9d5ff;
  --paper-bg-color: #dbeafe;
  --scissors-bg-color: #d1fae5;
  --lizard-bg-color: #fef3c7;
  --spock-bg-color: #fee2e2;
  --default-bg-color: #f3f4f6;
}

.dark {
  --rock-bg-color: rgba(147, 51, 234, 0.2);
  --paper-bg-color: rgba(59, 130, 246, 0.2);
  --scissors-bg-color: rgba(16, 185, 129, 0.2);
  --lizard-bg-color: rgba(245, 158, 11, 0.2);
  --spock-bg-color: rgba(239, 68, 68, 0.2);
  --default-bg-color: rgba(75, 85, 99, 0.2);
}

/* Transitions for the nodes */
svg circle {
  transition: fill 0.3s ease, stroke 0.3s ease;
}

/* Transitions for text */
svg text {
  transition: fill 0.3s ease;
}
</style>