{
	description = "Iceshrimp development flake";

	inputs = {
		nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
		flake-parts.url = "github:hercules-ci/flake-parts";
		devenv.url = "github:cachix/devenv";
	};
	outputs = inputs@{ flake-parts, ... }:
		flake-parts.lib.mkFlake { inherit inputs; } {
			imports = [
				inputs.devenv.flakeModule
			];

			systems = [
				"x86_64-linux"
				"aarch64-linux"
			];
			perSystem = { config, pkgs, ... }: {
				devenv = {
					shells = {
						default = {
							name = "iceshrimp-dev-shell";
							packages = [
								pkgs.python3
								pkgs.bun
							];
							devenv.warnOnNewVersion = false;
							languages.typescript.enable = true;
							languages.javascript.enable = true;
							languages.javascript.package = pkgs.bun;
							processes = {
								dev-server.exec = "bun run dev";
							};
							scripts = {
								build.exec = "bun run build";
								clean.exec = "bun run clean";
								clear-state.exec = "rm -rf .devenv/state/redis .devenv/state/postgres";
								format.exec = "bun run format";
								install-deps.exec = "bun install";
								migrate.exec = "bun run migrate";
								prepare-config.exec = "cp .config/devenv.yml .config/default.yml";
							};
							services = {
								postgres = {
									enable = true;
									package = pkgs.postgresql_16;
									initialDatabases = [{
										name = "iceshrimp";
									}];
									initialScript = ''
										CREATE USER iceshrimp WITH PASSWORD 'iceshrimp';
										ALTER USER iceshrimp WITH SUPERUSER;
										GRANT ALL ON DATABASE iceshrimp TO iceshrimp;
									'';
									listen_addresses = "127.0.0.1";
									port = 5432;
								};
								redis = {
									enable = true;
									bind = "127.0.0.1";
									port = 6379;
								};
							};
						};
					};
				};
			};
		};
}
