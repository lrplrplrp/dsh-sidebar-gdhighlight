/**
 * dsh-sidebar-gdhighlight — host (Node) side.
 *
 * This entry exists so the package is present in the profile's loader tree,
 * which is how `dsh-client-modules` discovers packages that declare
 * `dsh.client` and ships their `./client` bundle to the browser.
 *
 * All user-visible behavior (registering the GDScript file viewer with
 * `dsh-better-sidebar`) lives in the client bundle, because the
 * `betterSidebar` service is provided by `dsh-better-sidebar`'s client side.
 */
export const name = 'dsh-sidebar-gdhighlight'

export function apply() {
  // Nothing to do on the host side.
}
