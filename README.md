# Node dependency libyear stats & PR checks

[![codecov](https://codecov.io/gh/s0/libyear-node-action/branch/master/graph/badge.svg)](https://codecov.io/gh/s0/libyear-node-action) ![](https://raw.githubusercontent.com/s0/libyear-node-action/badges/drift.svg) ![](https://raw.githubusercontent.com/s0/libyear-node-action/badges/pulse.svg) ![](https://raw.githubusercontent.com/s0/libyear-node-action/badges/releases.svg) ![](https://raw.githubusercontent.com/s0/libyear-node-action/badges/major.svg) ![](https://raw.githubusercontent.com/s0/libyear-node-action/badges/minor.svg)

This GitHub Action will allow you to track how well a repository is keeping
up-to-date with NPM dependencies, using [libyear](https://libyear.com/).

This action is powered by the NPM package by the same name:
[libyear](https://www.npmjs.com/package/libyear).

It can be used in combination with other actions to generate badges (see below).

## Usage

Simply include the action `s0/libyear-node-action` in the appropriate point in
your workflow, and pass in the required configuration options:

*Note: For best results,
it is recommended you install your NPM using your preferred package manager
before running this action*

```yml
jobs:
  deploy:
    name: Deploy
    runs-on: ubuntu-latest
    steps:

    # Any prerequisite steps
    - uses: actions/checkout@master
    - run: npm install

    # Calculate libyear
    - uses: s0/libyear-node-action@v0.0.1
```

### Outputs

This action generates outputs that can be used in later steps or outputs
*(for example to generate badges to display in your README, see below)*.

The following outputs are generated.
Each of them represents a
[metric from libyear](https://github.com/jdanil/libyear#metrics).

| Output     | Description                                           |
| ---------- | ----------------------------------------------------- |
| `drift`    | A floating-point number with 2 decimal places         |
| `pulse`    | A floating-point number with 2 decimal places         |
| `releases` | An integer                                            |
| `major`    | An integer                                            |
| `minor`    | An integer                                            |
| `patch`    | An integer                                            |

### Generating badges using libyear stats

Here's an example workflow that will generate a badge for you and push it to
a special branch that can be referenced in e.g. your README.
It uses the actions
[`emibcn/badge-action`](https://github.com/emibcn/badge-action) and
[`s0/git-publish-subdir-action`](https://github.com/s0/git-publish-subdir-action)
in addition to this action.

```yml
name: Generate Badges
on:
  # Run on pushes to your main branch
  push:
    branches:
      - develop
  # Run every day
  schedule:
    - cron: "0 0 * * *"

jobs:
  get-badges:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@master
    - name: Use Node.js
      uses: actions/setup-node@v1
      with:
        node-version: 10.x

    # Install dependencies and run libyear
    # (notice how the libyear step has an id, this is referenced later)
    - run: npm install
    - id: libyear
      uses: s0/libyear-node-action@v0.0.1

    # Generate a badge and store it in the badge/directory
    - run: mkdir badges
    - uses: emibcn/badge-action@v1
      with:
        label: 'libyear'
        # Here is where we use the output from the libyear step
        status: ${{ steps.libyear.outputs.drift }} year(s) behind
        color: 'blue'
        path: 'badges/drift.svg'

    # Upload the directory "badge" as a branch "badge" on the same repo
    - uses: s0/git-publish-subdir-action@develop
      env:
        REPO: self
        BRANCH: badges
        FOLDER: badges
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        SQUASH_HISTORY: true
```

We use this for this repository, you can see the workflow here:
[`badges.yml`](.github/workflows/badges.yml)

## TODO

* Add functionality to compare libyear metrics between target and base of a pull
  request, and leave a comment on the PR with the difference.
* Allow for libyear to be run against different directories
  (e.g. to support monorepos)
* Allow for configuration of the arguments to send to libyear
* Switch to programmatic use once that becomes available in `libyear`
