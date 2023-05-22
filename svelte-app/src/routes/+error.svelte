<script>
    import { page } from "$app/stores";
</script>

<h1>Whoops!</h1>
<p>An error occurred. What a disappointment that is!</p>

<p>Error {$page.status}: {$page.error.message}</p>
