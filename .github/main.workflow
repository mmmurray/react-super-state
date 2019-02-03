workflow "New workflow" {
  on = "push"
  resolves = ["npm test"]
}

action "npm install" {
  uses = "actions/npm@3c8332795d5443adc712d30fa147db61fd520b5a"
  args = "install"
}

action "npm test" {
  uses = "actions/npm@3c8332795d5443adc712d30fa147db61fd520b5a"
  args = "test"
  needs = ["npm install"]
}
