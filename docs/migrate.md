# 🚚 Migrating from Firefish to Iceshrimp

> **Warning**
> Before proceeding, please **ensure you have an *up-to-date* backup of the database.**

## Preparations
First, follow Firefish's [downgrade guide](https://codeberg.org/firefish/firefish/src/branch/develop/docs/downgrade.md) to get back to v1.0.5-rc. When prompted to switch the docker image/git tag, make sure to pick `v1.0.5-rc`, and not `v20240206`. This is to make sure that the migration patch applies correctly.

### Docker
First, stop the container by running `docker compose down`.

Now, run `docker-compose run --rm --entrypoint '/bin/bash' web` to get a shell in the main container.

### Bare metal
First, stop the service. If using systemd, run `sudo systemctl stop firefish.service`.

Now, `cd` into the root of your firefish repository.

## Applying the migrations patch
To make sure migrations revert correctly, run `curl -s https://iceshrimp.dev/iceshrimp/iceshrimp/raw/branch/dev/docs/firefish-redis.patch | git apply --ignore-whitespace`. This will patch two built JS files related to redis. The patch is ephemeral, once you complete the migration process it will no longer apply. Iceshrimp-JS has the patch built in.

## Reverting the migrations
To begin, run `cd packages/backend` to switch to the backend workspace.

Now, revert all of the typeorm migrations. reverted. To do this, run the command `pnpm run revertmigration:typeorm` until the output confirms that the migration `FirefishRepo1689957674000` has been reverted successfully.

If migration `IncreaseHostCharLimit1692374635734` failed to revert, please run `DELETE FROM "migrations" WHERE "name" = 'IncreaseHostCharLimit1692374635734';` in the database shell.

If you get any other errors here please ask for support in the [chat room](https://chat.iceshrimp.dev).

Finally, revert all the cargo migrations, by running `pnpm run revertmigration:cargo` until `m20230806_170616_fix_antenna_stream_ids` has been reverted. Again, if you get any errors, please ask for support in the [chat room](https://chat.iceshrimp.dev).

## Switching to Iceshrimp
### Docker
First, run `docker compose down` to shut down firefish.

Now, switch out image for the `web` container with `iceshrimp.dev/iceshrimp/iceshrimp:latest`.
Furthermore, for every volume/mount that's mapped to /firefish, switch it out for /iceshrimp (leaving any trailing text intact).

Finally, run `docker compose up`, and make sure that it starts up correctly. If everything works, press CTRL+C and run `docker compoe up -d` to start it in the background.

If you get any errors on startup, please ask for support in the [chat room](https://chat.iceshrimp.dev).

### Bare metal
Before you begin, make sure `git-lfs` is installed on the system, and that the firefish service is stopped.

Then, switch back to the repository root directory and run `git remote set-url origin https://iceshrimp.dev/iceshrimp/iceshrimp.git`, as well as `git lfs install`.

Now, run `git fetch --all` to fetch the new commits.

If you get an error like `couldn't find remote ref` here, run `git config remote.origin.fetch "+refs/heads/*:refs/remotes/origin/*"`, followed by `git remote prune origin` and `git fetch --all`. If you still get any errors,  please ask for support in the [chat room](https://chat.iceshrimp.dev).

Then, run `git checkout dev` to switch to the `dev` branch, or `git checkout <tag>` to switch to a versioned tag. Make sure to run `git lfs pull` as well, to get all the dependencies.

Now, run `bun install && bun run build && bun run migrate` to install dependencies, build the project & run all pending migrations.

Finally, to clean up now-unnecessary files, run `rm -rf packages/backend/native-utils packages/megalodon`.

You should now be able to start the service back up.

If you get any errors during this process, please ask for support in the [chat room](https://chat.iceshrimp.dev).

## Closing notes
Please check out the [example configuration file](https://iceshrimp.dev/iceshrimp/iceshrimp/src/branch/dev/.config/example.yml), as it's changed quite a bit since Firefish and you may want to make use of the new features.

If you need further assistance for any reason, please ask for help in the [chat room](https://chat.iceshrimp.dev), we will assist you with the migration.
