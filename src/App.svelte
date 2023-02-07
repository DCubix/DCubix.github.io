<script lang="ts">
  import ProfilePicture from "./lib/components/ProfilePicture.svelte";
  import { Github, Linkedin, Mail, Play, PlayCircle } from 'lucide-svelte';
  import data from '../public/data.json';
    import Post from "./lib/components/Post.svelte";

  data.reverse();
</script>

<main class="w-full md:w-[90%] lg:w-3/4 xl:w-2/3 2xl:w-5/12 m-auto p-3 py-5 md:p-12">
  <div class="flex">
    <ProfilePicture/>
    <div class="flex flex-col md:ml-6 items-start">
        <span class="m-0 mb-1 font-mono font-semibold text-4xl md:text-6xl">Diego Lopes</span>
        <span class="m-0 mb-3 font-normal text-2xl md:text-2xl text-white text-opacity-50">Software Developer</span>
        
        <ul class="flex gap-3">
            <li>
              <a href="https://github.com/DCubix" title="GitHub" target="_blank" class="text-color-theme inline-block" rel="noreferrer">
                <Github size={32} />
              </a>
            </li>
            <li>
              <a href="https://www.linkedin.com/in/diego-lopes-a47056177/" title="LinkedIn" target="_blank" class="text-color-theme inline-block" rel="noreferrer">
                <Linkedin size={32} />
              </a>
            </li>
            <li>
              <a href="mailto:diego95lopes@gmail.com" title="E-mail" target="_blank" class="text-color-theme inline-block" rel="noreferrer">
                <Mail size={32} />
              </a>
            </li>
        </ul>
    </div>
  </div>

  <h1 class="text-2xl font-semibold my-5">My Gallery</h1>
  <div class="w-full">
    {#each data as item}
      <Post item={item} />
    {/each}
  </div>
</main>
