# Custom Reverse Proxy

A custom reverse proxy built using TypeScript, leveraging popular libraries like `zod`, `yaml`, and `commander` for validation, configuration, and command-line interface (CLI) functionalities. This project serves as a lightweight, extensible solution to manage and route incoming requests to backend services.

## 🚀 Features

- **TypeScript-powered**: Strongly typed with TypeScript to ensure reliable and scalable code.
- **Zod for Validation**: Input validation using `zod` to ensure only valid configurations are processed.
- **Command-line Interface (CLI)**: Use `commander` to interact with the proxy via a powerful and customizable CLI.
- **Dynamic Configuration**: Utilize `yaml` for dynamic configuration to easily modify routing behavior.
- **Efficient Development**: Integrated `tsc-watch` for efficient development and hot-reloading of TypeScript changes.

## 🔧 Installation

Clone the repository and install dependencies using `pnpm`:

```bash
https://github.com/sidhyaashu/Custom-reverse-proxy.git
cd Custom-reverse-proxy
pnpm install
```

## 🛠️ Setup

### 1. Initialize Project

To set up the project with TypeScript and necessary dependencies, run:

```bash
pnpm init
pnpm add -D typescript
pnpm install @types/node
pnpm tsc --init
pnpm install tsc-watch -D
```

### 2. Install Dependencies

To install the required libraries, run:

```bash
pnpm add zod yaml commander
```

These libraries enable the proxy's functionality, including validation, configuration handling, and CLI support.

## ⚙️ Configuration

The proxy uses a YAML configuration file to define routing rules. You can create a `config.yaml` file at the root of the project with the following structure:

```yaml
server:
  listen: 8080
  workers: 4

  upstreams:
    - id: node1
      url: jsonplaceholder.typicode.com

    - id: node2
      url: http://localhost:8002

  headers:
    - key: x-forward-for
      value: '$ip'

    - key: Authorization
      value: 'Bearer xyz'

  rules:
    - path: /
      upstreams:
        - node1,
        - node2

    - path: /admin
      upstreams:
        - node2

    - path: /todos
      upstreams:
        - node1

```

### Example CLI Usage

To start the reverse proxy using a specific configuration file:

```bash
pnpm start --config=config.yaml
```

The `commander` CLI supports a variety of commands and options for customization.

## 📚 Documentation

- **TypeScript**: Learn more about TypeScript [here](https://www.typescriptlang.org/).
- **Zod**: Official documentation for input validation can be found [here](https://github.com/colinhacks/zod).
- **YAML**: Learn more about YAML [here](https://yaml.org/).
- **Commander**: CLI framework documentation is available [here](https://github.com/tj/commander.js/).



### Key Sections Explained:

- **Features**: Lists the core features of your project to quickly highlight its advantages.
- **Installation**: Provides clear steps for setting up the project using `pnpm`.
- **Setup**: Describes how to initialize the project with TypeScript and install dependencies.
- **Configuration**: Shows how to configure routing using `yaml`.
- **CLI Usage**: Explains how to run the proxy with specific commands.
- **Documentation**: Provides links to documentation for libraries and tools used in the project.
- **Testing**: Details the testing process to ensure the stability of the project.
- **Contributing**: Encourages others to contribute to the project with detailed steps.
- **License**: Specifies the project's open-source license.

This structure ensures your project is well-documented, easy to understand, and user-friendly for others who want to explore or contribute to it.